import { useParams } from "react-router-dom";
import MultiplayerBoard from "./MultiplayerBoard";

const MultiplayerBoardWrapper = () => {
  const { roomName, player } = useParams(); // get both roomName and chosen player symbol from URL
  return <MultiplayerBoard roomName={roomName} initialSymbol={player} />; // pass as initialSymbol
};

export default MultiplayerBoardWrapper;
