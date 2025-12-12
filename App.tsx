import React, { useState } from 'react';
import Layout from './components/Layout';
import HomeView from './views/HomeView';
import DetailView from './views/DetailView';
import ProfileView from './views/ProfileView';
import ImportView from './views/ImportView';

export type NavTab = 'home' | 'mine';
type ViewState = 
  | { type: 'TAB', tab: NavTab }
  | { type: 'DETAIL', sessionId: string }
  | { type: 'IMPORT' };

const App: React.FC = () => {
  const [viewState, setViewState] = useState<ViewState>({ type: 'TAB', tab: 'home' });

  const navigateToTab = (tab: NavTab) => {
    setViewState({ type: 'TAB', tab });
  };

  const navigateToDetail = (sessionId: string) => {
    setViewState({ type: 'DETAIL', sessionId });
  };

  const navigateToImport = () => {
    setViewState({ type: 'IMPORT' });
  };

  const navigateBack = () => {
    setViewState({ type: 'TAB', tab: 'home' });
  };

  // Content Renderer
  const renderContent = () => {
    if (viewState.type === 'DETAIL') {
      return <DetailView sessionId={viewState.sessionId} onBack={navigateBack} />;
    }
    if (viewState.type === 'IMPORT') {
      return <ImportView onBack={navigateBack} onImportSuccess={navigateBack} />;
    }
    
    // Tab Views inside Layout
    return (
      <Layout activeTab={viewState.tab} onTabChange={navigateToTab}>
        {viewState.tab === 'home' && (
          <HomeView onSessionClick={navigateToDetail} onImportClick={navigateToImport} />
        )}
        {viewState.tab === 'mine' && <ProfileView />}
      </Layout>
    );
  };

  return (
    // Outer Desktop Container (Centers the app on large screens)
    <div className="w-full h-[100dvh] flex justify-center items-center bg-slate-200 overflow-hidden">
      
      {/* Mobile App Container */}
      <div className="w-full h-full max-w-[480px] bg-[#FDFBF7] relative flex flex-col shadow-2xl overflow-hidden sm:rounded-[2rem] sm:h-[95dvh] sm:border-8 sm:border-white">
        
        {/* Global Mesh Background Layer */}
        <div className="mesh-bg pointer-events-none">
          <div className="mesh-blob blob-1"></div>
          <div className="mesh-blob blob-2"></div>
          <div className="mesh-blob blob-3"></div>
        </div>

        {/* Main Content Layer */}
        <div className="flex-1 relative z-10 w-full h-full overflow-hidden">
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

export default App;