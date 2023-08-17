import { useState } from 'react';
import Messanger from './components/Messanger/Messanger.component';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.messages}>
      <Messanger />
    </div>
  );
}

export default App;
