const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AgentSolanaRegistry = sequelize.define(
  "AgentSolanaRegistry",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    agent_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },
    registry_address: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Optional Anchor PDA or external registry account for this agent",
    },
    registration_signature: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    registration_slot: {
      type: DataTypes.BIGINT,
      allowNull: true,
    },
    proof_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    current_score: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    current_risk_level: {
      type: DataTypes.STRING,
      defaultValue: "unknown",
    },
    last_verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verification_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("registered", "verified", "flagged", "suspended"),
      defaultValue: "registered",
    },
    network: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "devnet",
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    tableName: "agent_solana_registry",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      { fields: ["agent_id"] },
      { fields: ["registration_signature"] },
      { fields: ["status"] },
      { fields: ["network"] },
    ],
  },
);

module.exports = AgentSolanaRegistry;
