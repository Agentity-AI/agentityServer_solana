import { authentication } from "../../store/zustant/useZustandHook";
import Active from "./Active";
import Finished from "./Finished";
import NoActive from "./NoActive";

function SimulationState({run}) {
    const {runSimulationData}=authentication();
 switch(run){
    case "running":
        return <Active />;
    case "final":
        return runSimulationData?<Finished data={runSimulationData}/>:<NoActive />;
    default:
        return <NoActive />;
 }

}

export default SimulationState