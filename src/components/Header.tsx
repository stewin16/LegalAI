import { Navbar } from "./ui/mini-navbar";

const Header = ({ autoHide = false }: { autoHide?: boolean }) => {
  // autoHide prop is now ignored as we switched to a permanent navbar
  return <Navbar />;
};

export default Header;
