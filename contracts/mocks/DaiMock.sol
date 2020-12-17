// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract DaiMock is ERC20  {

    constructor(string memory name_, string memory symbol_) public ERC20(name_, symbol_) { }

    /// @dev Mint dai.
    /// @param to Wallet to mint the dai in.
    /// @param daiAmount Amount of dai to mint.
    function mint(address to, uint256 daiAmount) public {
        _mint(to, daiAmount);
    }

    /// @dev Burn dai.
    /// @param from Wallet to burn the dai from.
    /// @param daiAmount Amount of dai to burn.
    function burn(address from, uint256 daiAmount) public {
        _burn(from, daiAmount);
    }
}
