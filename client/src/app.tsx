import { AxiosProvider } from "./providers/AxiosProvider";
import { ImagesProvider } from "./providers/ImagesProvider";
import { ImagesPage } from "./pages/ImagesPage";

export const App = () => {
  return (
    <AxiosProvider>
      <ImagesProvider>
        <ImagesPage />
      </ImagesProvider>
    </AxiosProvider>
  );
};
