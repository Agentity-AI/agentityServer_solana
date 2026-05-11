import React, { useEffect } from 'react'
import AppLayout from '../layouts/AppLayouts'
import { authentication } from '../store/zustant/useZustandHook';
import { Bot, Plus } from 'lucide-react';
import Modal from '../components/model/Modal';
import NewAuditForm from '../components/popups/NewAuditForm';
import AuditTable from '../components/table/AuditTable';

function SmartContract() {
    const [open, setOpen] = React.useState(false);
    const {getAuditHistory,audits}=authentication();

    useEffect(() => {
        const loadAuditHistory = async () => {
          try {          
            await getAuditHistory();
          } catch (err) {
            console.error("Failed to load audit history:", err);
          }
        };

        loadAuditHistory();
    }, [getAuditHistory]);

  return (
    <AppLayout>
  <div className="mb-6 p-4 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-1">Smart Contracts Audits</h1>
          <p className="text-sm text-base-content/60 text-white">
            Automated security analysis for smart contracts
          </p>
        </div>

        <button
          className="bg-[#06b0ff] btn-sm mt-4 flex px-4 py-2 rounded-lg border-none text-white:hover:bg-[#06b0ff]/90"
          onClick={() => setOpen(true)}
        >
          <Plus className=" mr-2" size={30} />
          <span>New Audit</span>
        </button>
      </div>

      <div className="border-[#514c4c] bg-[#0f0f0f] rounded-lg border">
        <div className="items-center gap-4 p-4 border-b border-[#514c4c]">
          <div className="flex relative left-4">
            <Bot className="text-primary " size={24} />
            <h2 className="text-xl font-semibold">Registered Agents</h2>
            <span className="text-xl text-[#f5f8f9]">
              ({audits?.length ?? 0})
            </span>
          </div>

          <div>
            <table className="table-auto w-full mt-5  ">
              <thead className="relative left-4 grid">
                <tr className=" py-2 h-10 w-full grid grid-cols-5 hover:bg-[#2f2f2f]">
                  <td className="text-left text-sm text-base-content/60">
                    Contract Name
                  </td>
                  <td className="text-left text-sm text-base-content/60">
                    Risk Level
                  </td>
                  <td className="text-left text-sm text-base-content/60">
                    Consensus Score
                  </td>
                  <td className="text-left text-sm text-base-content/60">
                    Status
                  </td>
                  <td className="text-left text-sm text-base-content/60">
                    Actions
                  </td>
                </tr>
              </thead>
              <tbody >
                {audits&&(audits.map((audit) => (
                  <AuditTable key={audit.id} 
                   contractname={audit.contractName} risklevel={audit.riskLevel} consensusScore={audit.consensusScore} status={audit.status} />
                )))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <NewAuditForm onClose={() => setOpen(false)} />
      </Modal>
    </AppLayout>
   
  )
}

export default SmartContract