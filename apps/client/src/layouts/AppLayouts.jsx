import Sidebar from "../components/layouts/SideBar";
import Topbar from "../components/layouts/Topbar";


function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-base-300 text-base-content flex">
      {/* Sidebar */}
      <aside className="w-60 bg-base-200 border-r border-[#242323] hidden md:flex">
        <Sidebar />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 border-b border-[#242323] flex items-center">
          <Topbar />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
