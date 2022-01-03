// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
  function totalSupply() external view returns (uint256);

  function balanceOf(address account) external view returns (uint256);

  function transfer(address recipient, uint256 amount) external returns (bool);

  function allowance(address owner, address spender)
    external
    view
    returns (uint256);

  function approve(address spender, uint256 amount) external returns (bool);

  function transferFrom(
    address sender,
    address recipient,
    uint256 amount
  ) external returns (bool);

  event Transfer(address indexed from, address indexed to, uint256 value);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract TicTacToe {
  enum CellState {
    Empty,
    X,
    O
  }

  struct room {
    address player1;
    address player2;
    uint256 stakes;
    uint8 current_move;
    CellState[9] board;
    bool end;
  }

  address public token;

  room[] public rooms;
  uint256 public roomCount = 0;

  // uint8 current_move = 0;

  uint256[][] winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  
  constructor(address _token) {
    token = _token;
  }

  function createRoom() external {
    uint256 _stakes = IERC20(token).allowance(msg.sender, address(this));
    require(_stakes > 0, "Please deposit token");
    IERC20(token).transfer(address(this), _stakes);
    rooms.push(room(msg.sender, address(0), _stakes, 0, [CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty, CellState.Empty], false));
    roomCount += 1;
  }

  function player1Address(uint256 roomId) public view returns (address) {
    return rooms[roomId].player1;
  }

  function player2Address(uint256 roomId) public view returns (address) {
    return rooms[roomId].player2;
  }

  function deposit(uint256 roomId) external {
    uint256 payAmount = IERC20(token).allowance(msg.sender, address(this));
    require(payAmount == rooms[roomId].stakes, "Wrong amount of money");
    IERC20(token).transfer(address(this), payAmount);
    rooms[roomId].player2 = msg.sender;
  }

  // 10000000000000000
  function withdraw(uint256 roomId) external {
    if (
      winner(roomId) == address(0) && rooms[roomId].current_move > 8
    ) {
      IERC20(token).transfer(rooms[roomId].player1, rooms[roomId].stakes);
      IERC20(token).transfer(rooms[roomId].player2, rooms[roomId].stakes);
    } else if(msg.sender == winner(roomId)) IERC20(token).transfer(msg.sender, rooms[roomId].stakes);
  }

  function rowToString(uint256 roomId) public view returns (string memory) {
    return
      string(
        abi.encodePacked(
          cellToString(roomId, 0),
          "|",
          cellToString(roomId, 1),
          "|",
          cellToString(roomId, 2),
          "|",
          cellToString(roomId, 3),
          "|",
          cellToString(roomId, 4),
          "|",
          cellToString(roomId, 5),
          "|",
          cellToString(roomId, 6),
          "|",
          cellToString(roomId, 7),
          "|",
          cellToString(roomId, 8)
        )
      );
  }

  function performMove(uint256 roomId, uint8 cellID) public {
    require((rooms[roomId].player1 != address(0)) && (rooms[roomId].player2 != address(0)), "only 2 players");
    require(msg.sender == rooms[roomId].player1 || msg.sender == rooms[roomId].player2);
    require(!isGameOver(roomId));
    require(msg.sender == currentPlayerAddress(roomId));

    require(positionIsInBounds(cellID), "Choose valid cell number");
    require(rooms[roomId].board[cellID] == CellState.Empty);

    rooms[roomId].board[cellID] = currentPlayerShape(roomId);
    rooms[roomId].current_move += 1;
  }

  function currentPlayerAddress(uint256 roomId) public view returns (address) {
    if (rooms[roomId].current_move % 2 == 0) {
      return rooms[roomId].player2;
    } else {
      return rooms[roomId].player1;
    }
  }

  function currentPlayerShape(uint256 roomId) private view returns (CellState) {
    if (rooms[roomId].current_move % 2 == 0) {
      return CellState.X;
    } else {
      return CellState.O;
    }
  }

  function winner(uint256 roomId) public view returns (address) {
    CellState winning_shape = checkWinner(roomId);
    if (winning_shape == CellState.X) {
      return rooms[roomId].player2;
    } else if (winning_shape == CellState.O) {
      return rooms[roomId].player1;
    }
    else return address(0);
  }

  function isGameOver(uint256 roomId) public view returns (bool) {
    return (checkWinner(roomId) != CellState.Empty || rooms[roomId].current_move > 8);
  }

  function checkWinner(uint256 roomId) private view returns (CellState) {
    for (uint8 i = 0; i < winningCombinations.length; i++) {
      uint256[] memory combination = winningCombinations[i];
      if (
        rooms[roomId].board[combination[0]] != CellState.Empty &&
        rooms[roomId].board[combination[0]] ==
        rooms[roomId].board[combination[1]] &&
        rooms[roomId].board[combination[0]] ==
        rooms[roomId].board[combination[2]]
      ) {
        return rooms[roomId].board[combination[0]];
      }
    }
    return CellState.Empty;
  }

  function cellToString(uint256 roomId, uint8 cellID)
    private
    view
    returns (string memory)
  {
    require(positionIsInBounds(cellID), "Choose valid cell number");

    if (rooms[roomId].board[cellID] == CellState.Empty) {
      return " ";
    }
    if (rooms[roomId].board[cellID] == CellState.X) {
      return "X";
    }
    if (rooms[roomId].board[cellID] == CellState.O) {
      return "O";
    }
  }

  function positionIsInBounds(uint8 cellID) private pure returns (bool) {
    return (cellID >= 0 && cellID < 9);
  }
}
