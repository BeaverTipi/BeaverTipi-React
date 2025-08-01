import React, { useState } from 'react';
import OfficeInfo from './OfficeInfoChild.jsx';
import OfficeNameCard from './OfficeNameCard.jsx';
import OfficeInfoMap from './OfficeInfoMap.jsx';
import ComponentCard from '../common/ComponentCard.jsx';
import OfficeInfoNavigation from './OfficeInfoNavigation.jsx';
import PageBreadCrumb from "../common/PageBreadCrumb";
import { AnimatePresence, motion } from "framer-motion";


const TABS = [
  { key: 'info', label: '사무소정보' },
  { key: 'card', label: '내명함관리' },
  { key: 'map', label: '지도' },
];

export default function OfficeInfoMain() {
  const [tab, setTab] = useState('info');

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <PageBreadCrumb pageTitle="오피스 관리" />
          {/* <OfficeInfoNavigation /> */}
          <ComponentCard
            title="📝 중개사무소 관리"
          >
            <div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      padding: '10px 28px',
                      border: 'none',
                      borderBottom: tab === key ? '3px solid #3a5dfb' : '3px solid transparent',
                      background: 'none',
                      color: tab === key ? '#3a5dfb' : '#444',
                      fontWeight: tab === key ? 700 : 500,
                      fontSize: 16,
                      cursor: 'pointer',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div>
                {tab === 'info' && <OfficeInfo onEditTabMove={() => setTab('card')} />}
                {tab === 'card' && <OfficeNameCard />}
                {tab === 'map' && <OfficeInfoMap />}

              </div>
            </div>
          </ComponentCard>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
