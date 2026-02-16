// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ChemicalStorage {

    struct BasicInfo {
        string company;
        string name;
        string formula;
        string casNumber;
        uint quantity;
    }

    struct ExtraInfo {
        string batch;
        string manuDate;
        string expDate;
        string storageConditions; // avoid 'storage' keyword
        string country;
        string state;
        string city;
        string useType;
        string question;
    }

    struct Chemical {
        BasicInfo basic;
        ExtraInfo extra;
    }

    Chemical[] public chemicals;

    // Store chemical with 2 structs → avoids "stack too deep"
    function storeChemical(BasicInfo memory basic, ExtraInfo memory extra) public {
        chemicals.push(Chemical({
            basic: basic,
            extra: extra
        }));
    }

    function getChemical(uint index) public view returns (Chemical memory) {
        require(index < chemicals.length, "Index out of bounds");
        return chemicals[index];
    }

    function getChemicalCount() public view returns (uint) {
        return chemicals.length;
    }
}
