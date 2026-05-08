use anchor_lang::prelude::*;

declare_id!("Agnt111111111111111111111111111111111111111");

#[program]
pub mod agentity_registry {
    use super::*;

    pub fn register_agent(
        ctx: Context<RegisterAgent>,
        agent_id: String,
        fingerprint: [u8; 32],
        capabilities_hash: [u8; 32],
    ) -> Result<()> {
        require!(agent_id.len() <= AgentProfile::MAX_AGENT_ID_LEN, AgentityError::AgentIdTooLong);

        let profile = &mut ctx.accounts.profile;
        profile.authority = ctx.accounts.authority.key();
        profile.agent_id = agent_id;
        profile.fingerprint = fingerprint;
        profile.capabilities_hash = capabilities_hash;
        profile.reputation_score = 0;
        profile.action_count = 0;
        profile.flag_count = 0;
        profile.bump = ctx.bumps.profile;

        Ok(())
    }

    pub fn set_capability_policy(
        ctx: Context<SetCapabilityPolicy>,
        policy_hash: [u8; 32],
        max_risk_score: u16,
        active: bool,
    ) -> Result<()> {
        require!(max_risk_score <= 100, AgentityError::InvalidRiskScore);

        let policy = &mut ctx.accounts.policy;
        policy.profile = ctx.accounts.profile.key();
        policy.authority = ctx.accounts.authority.key();
        policy.policy_hash = policy_hash;
        policy.max_risk_score = max_risk_score;
        policy.active = active;
        policy.bump = ctx.bumps.policy;

        Ok(())
    }

    pub fn log_action(
        ctx: Context<LogAction>,
        action_hash: [u8; 32],
        result_hash: [u8; 32],
        risk_score: u16,
    ) -> Result<()> {
        require!(risk_score <= 100, AgentityError::InvalidRiskScore);

        let profile = &mut ctx.accounts.profile;
        let action = &mut ctx.accounts.action_log;

        action.profile = profile.key();
        action.authority = ctx.accounts.authority.key();
        action.action_hash = action_hash;
        action.result_hash = result_hash;
        action.risk_score = risk_score;
        action.created_at = Clock::get()?.unix_timestamp;
        action.bump = ctx.bumps.action_log;

        profile.action_count = profile.action_count.saturating_add(1);
        if risk_score >= 70 {
            profile.flag_count = profile.flag_count.saturating_add(1);
        }

        Ok(())
    }

    pub fn update_reputation(ctx: Context<UpdateReputation>, score: u16) -> Result<()> {
        require!(score <= 100, AgentityError::InvalidRiskScore);

        let profile = &mut ctx.accounts.profile;
        profile.reputation_score = score;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(agent_id: String)]
pub struct RegisterAgent<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init,
        payer = authority,
        space = 8 + AgentProfile::INIT_SPACE,
        seeds = [b"agent", authority.key().as_ref(), agent_id.as_bytes()],
        bump
    )]
    pub profile: Account<'info, AgentProfile>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SetCapabilityPolicy<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, AgentProfile>,
    #[account(
        init,
        payer = authority,
        space = 8 + CapabilityPolicy::INIT_SPACE,
        seeds = [b"policy", profile.key().as_ref()],
        bump
    )]
    pub policy: Account<'info, CapabilityPolicy>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(action_hash: [u8; 32])]
pub struct LogAction<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, AgentProfile>,
    #[account(
        init,
        payer = authority,
        space = 8 + AgentActionLog::INIT_SPACE,
        seeds = [b"action", profile.key().as_ref(), action_hash.as_ref()],
        bump
    )]
    pub action_log: Account<'info, AgentActionLog>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority)]
    pub profile: Account<'info, AgentProfile>,
}

#[account]
#[derive(InitSpace)]
pub struct AgentProfile {
    pub authority: Pubkey,
    #[max_len(64)]
    pub agent_id: String,
    pub fingerprint: [u8; 32],
    pub capabilities_hash: [u8; 32],
    pub reputation_score: u16,
    pub action_count: u64,
    pub flag_count: u64,
    pub bump: u8,
}

impl AgentProfile {
    pub const MAX_AGENT_ID_LEN: usize = 64;
}

#[account]
#[derive(InitSpace)]
pub struct CapabilityPolicy {
    pub profile: Pubkey,
    pub authority: Pubkey,
    pub policy_hash: [u8; 32],
    pub max_risk_score: u16,
    pub active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct AgentActionLog {
    pub profile: Pubkey,
    pub authority: Pubkey,
    pub action_hash: [u8; 32],
    pub result_hash: [u8; 32],
    pub risk_score: u16,
    pub created_at: i64,
    pub bump: u8,
}

#[error_code]
pub enum AgentityError {
    #[msg("Agent ID is too long")]
    AgentIdTooLong,
    #[msg("Risk score must be between 0 and 100")]
    InvalidRiskScore,
}
