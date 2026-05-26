import tabStyles from '../styles/TabPanel.module.css';

export default function TabPanel({ tabs, activeTab, onTabChange, children }) {
  return (
    <div className={tabStyles.panel}>
      <div className={tabStyles.bar}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`${tabStyles.tab} ${activeTab === tab.key ? tabStyles.active : ''}`}
            onClick={() => onTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={tabStyles.content}>{children}</div>
    </div>
  );
}
