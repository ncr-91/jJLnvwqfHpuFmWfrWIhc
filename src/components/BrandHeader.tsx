import CandaIcon from "../assets/images/canda_icon.png";

function Header() {
  return (
    <header>
      <div className="flex justify-center -mt-5 pb-3">
        <img className="w-14 h-13" src={CandaIcon} alt="Canda" />
      </div>
      <div className="mb-6 border-b border-frost-gray-300"></div>
    </header>
  );
}

export default Header;
