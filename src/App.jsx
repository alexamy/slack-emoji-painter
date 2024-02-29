import './App.css';
import { createStore } from 'solid-js/store';

export function App() {
  const [store, setStore] = createStore({});

  return (
    <>
      <h1>Vite + Solid</h1>
    </>
  )
}
