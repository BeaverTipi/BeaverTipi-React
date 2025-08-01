import { DomainProvider } from "./DomainProvider";
import { ThemeProvider } from "./ThemeContext";
import { ContextMenuProvider } from "./ContextMenuContext";
import { AESProvider } from "./AESProvider";
import { SecureAxiosProvider } from "./SecureAxiosProvider";
import { AxiosProvider } from "./AxiosProvider";

export default function AppProviders({ children }) {
  return (
    <DomainProvider>
      <ThemeProvider>
        <ContextMenuProvider>

          <AESProvider>
            <AxiosProvider>
              <SecureAxiosProvider>
                {children}
              </SecureAxiosProvider>
            </AxiosProvider>
          </AESProvider>

        </ContextMenuProvider>
      </ThemeProvider>
    </DomainProvider>
  );
}
