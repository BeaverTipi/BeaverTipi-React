import { DomainProvider } from "./DomainProvider";
import { ThemeProvider } from "./ThemeContext";
import { ContextMenuProvider } from "./ContextMenuContext";
import { AESProvider } from "./AESProvider";
import { SecureAxiosProvider } from "./SecureAxiosProvider";

export default function AppProviders({ children }) {
  return (
    <DomainProvider>
      <ThemeProvider>
        <ContextMenuProvider>

          <AESProvider>
            <SecureAxiosProvider>
              {children}
            </SecureAxiosProvider>
          </AESProvider>

        </ContextMenuProvider>
      </ThemeProvider>
    </DomainProvider>
  );
}
