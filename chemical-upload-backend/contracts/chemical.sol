// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChemicalStorage {
    struct Chemical {
        string company;
        string name;
        string formula;
        string casNumber;
        uint256 quantity;
        string batch;
        string manuDate;
        string expDate;
        string storageConditions;
        string country;
        string state;
        string city;
        string useType;
        string question;
        uint256 timestamp;
    }

    mapping(uint256 => Chemical) public chemicals;
    uint256 public chemicalCount;

    event ChemicalAdded(uint256 id, string name, string company);

    // ✅ Use a struct as input to avoid "stack too deep"
    function addChemical(Chemical memory _chemical) public {
        chemicalCount++;
        _chemical.timestamp = block.timestamp;
        chemicals[chemicalCount] = _chemical;
        emit ChemicalAdded(chemicalCount, _chemical.name, _chemical.company);
    }

    function getChemical(uint256 _id)
        public
        view
        returns (Chemical memory)
    {
        return chemicals[_id];
    }

    function getAllChemicals() public view returns (Chemical[] memory) {
        Chemical[] memory all = new Chemical[](chemicalCount);
        for (uint256 i = 1; i <= chemicalCount; i++) {
            all[i - 1] = chemicals[i];
        }
        return all;
    }
}
