pragma solidity ^0.4.6;
pragma experimental ABIEncoderV2;

contract SupplyChain
{
    Location[] public chainItems;

    struct Location{
        string Name;
        uint LocationId;
        uint PreviousLocationId;
        uint Timestamp;
        string Secret;
    }
    
    mapping(uint => Location) Trail;
    uint8 TrailCount=0;

    function AddNewLocation(uint LocationId, string Name, string Secret) returns (bool success)
    {
        Location memory newLocation;
        newLocation.Name = Name;
        newLocation.LocationId= LocationId;
        newLocation.Secret= Secret;
        newLocation.Timestamp = now;
        if(TrailCount!=0)
        {
            newLocation.PreviousLocationId= Trail[TrailCount].LocationId;
        }
        Trail[TrailCount] = newLocation;
        chainItems.push(newLocation);
        TrailCount++;
        return true;
    }
    function getChainItems() constant returns (string[], uint[], uint[]) {
        uint length = chainItems.length;

        string[] memory name = new string[](length);
        uint[] memory locationId = new uint[](length);
        uint[] memory timestamp = new uint[](length);

        for (uint i = 0; i < TrailCount; i++) {
            name[i] = chainItems[i].Name;
            locationId[i] = chainItems[i].LocationId;
            timestamp[i] = chainItems[i].Timestamp;
        }
        // return TrailCount;
        return (name, locationId, timestamp);
    }

    function GetTrailCount() returns(uint8){
        return TrailCount;
    }

    function GetLocation(uint8 TrailNo) returns (string,uint,uint,string)
    {
        return (Trail[TrailNo].Name, Trail[TrailNo].LocationId, Trail[TrailNo].Timestamp,Trail[TrailNo].Secret);
    }
}