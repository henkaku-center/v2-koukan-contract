// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HenkakuKoukan is Ownable {
    IERC20 public v1Token;
    IERC20 public v2Token;

    event Claim(uint amount, address who);

    constructor(address _v1, address _v2) {
        v1Token = IERC20(_v1);
        v2Token = IERC20(_v2);
    }

    function claimV2Token() public {
        uint256 v1TokenAmount = v1Token.balanceOf(msg.sender);
        require(v1TokenAmount > 0, "INVALID: YOU DO NOT HAVE V1 TOKEN");
        require(v2Token.balanceOf(address(this)) >= v1TokenAmount, "INVALID: INSUFFICIENT AMOUNT");
        v1Token.transferFrom(msg.sender, address(this), v1TokenAmount);
        v2Token.transfer(msg.sender, v1TokenAmount);
        emit Claim(v1TokenAmount, msg.sender);
    }

    function widthdraw(address token) public onlyOwner() {
        require(IERC20(token).balanceOf(address(this)) > 0, "INVLAID: INSUFFICENT AMOUNT");
        IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
    }
}
