import { AESProvider } from "./AESProvider";
import { AxiosProvider } from "./AxiosProvider";
import { ContextMenuProvider } from "./ContextMenuContext";
import { DomainProvider } from "./DomainProvider";
import { ThemeProvider } from "./ThemeContext";

export default function AppProviders({ children }) {
  return (
    <DomainProvider>
      <ThemeProvider>
        <ContextMenuProvider>
          <AxiosProvider>
            <AESProvider>
              {children}
            </AESProvider>
          </AxiosProvider>
        </ContextMenuProvider>
      </ThemeProvider>
    </DomainProvider>
  );
}
