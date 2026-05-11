import AgentPlatform from "../components/agentPlatform/AgentPlatform"
import LandingPageAgentWork from "../components/landingPageAgentWork/LandingPageAgentWork"
import LandingPageFooter from "../components/landingPageFooter/LandingPageFooter"
import LandingPageIntro from "../components/landingPageIntro/LandingPageIntro"
import LandingTopbar from "../components/layouts/LandingTopbar"
import { authentication } from "../store/zustant/useZustandHook"

function LandingPage() {
   const { loading ,dashBoard} = authentication();

  return (
    <div>
      <LandingTopbar dashboardData={dashBoard} loading={loading}/>
      <LandingPageIntro/>
      <AgentPlatform/>
      <LandingPageAgentWork/>
      <LandingPageFooter/>

    </div>
  )
}

export default LandingPage
