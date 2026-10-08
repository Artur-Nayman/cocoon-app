import { tabs } from '../context/constants';
import { useAppContext } from '../context/useAppContext';
import styles from '../styles/App.module.css';
import ChannelGrid from './ChannelGrid';
import MixerPanel from './MixerPanel';
import ResourcesPanel from './ResourcesPanel';
import SceneManager from './SceneManager';
import SleepTimer from './SleepTimer';
import SoundBrowser from './SoundBrowser';
import TabPanel from './TabPanel';

export default function SideColumn() {
  const {
    activeTab, setActiveTab,
    handleAddChannel, handleAddVisual, addResource,
    channels, masterVolume,
    handleToggleChannel, handleChannelVolume, handleRemoveChannel,
    setBackendStatus,
    setMasterVolume, handleToggleAll, allPlaying,
    sleepTimer,
    saveCurrentAsScene,
    scenes, saveScene, deleteScene, handleSceneLoad,
    visual, resources,
    editingScene, setEditingScene,
    deleteResource,
  } = useAppContext();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sounds':
        return <SoundBrowser onAddChannel={handleAddChannel} onAddVisual={handleAddVisual} onSaveResource={addResource} />;
      case 'mixer':
        return (
          <div>
            <ChannelGrid
              channels={channels}
              masterVolume={masterVolume}
              onToggle={handleToggleChannel}
              onVolume={handleChannelVolume}
              onRemove={handleRemoveChannel}
              onBackendStatus={setBackendStatus}
            />
            <MixerPanel
              channels={channels}
              masterVolume={masterVolume}
              onMasterVolume={setMasterVolume}
              onChannelVolume={handleChannelVolume}
              onToggleChannel={handleToggleChannel}
              onRemoveChannel={handleRemoveChannel}
              onToggleAll={handleToggleAll}
              allPlaying={allPlaying}
            />
            <SleepTimer
              minutes={sleepTimer.sleepMinutes}
              remaining={sleepTimer.remaining}
              label={sleepTimer.label}
              onToggle={sleepTimer.toggle}
            />
            <button type="button" className={styles.saveSceneBtn} onClick={saveCurrentAsScene}>
              💾 Save Current Mix
            </button>
          </div>
        );
      case 'configure':
        return (
          <div>
            <SceneManager
              key={editingScene?.id || 'new'}
              scenes={scenes}
              onSave={saveScene}
              onDelete={deleteScene}
              onLoad={handleSceneLoad}
              currentConfig={{ visual, channels }}
              resources={resources}
              editingScene={editingScene}
              onEditDone={() => setEditingScene(null)}
            />
          </div>
        );
      case 'resources':
        return (
          <ResourcesPanel
            resources={resources}
            onAdd={addResource}
            onDelete={deleteResource}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.sideColumn}>
      <TabPanel tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {renderTabContent()}
      </TabPanel>
    </div>
  );
}
