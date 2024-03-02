import "./App.css";
import { StoreProvider } from "./context";
import { Buttons } from "./parts/buttons";
import { CurrentEmoji } from "./parts/currentEmoji";
import { Field } from "./parts/field";
import { FieldSize } from "./parts/fieldSize";
import { Help } from "./parts/help";
import { List } from "./parts/list";

// app
export function App() {
  return (
    <StoreProvider>
      <div class="app">
        <CurrentEmoji />
        <List />
        <Buttons />
        <FieldSize />
        <Field />
        <Help />
      </div>
    </StoreProvider>
  );
}
