import "Owned.sol";

contract AppStore is Owned{

    struct Product{
        string name;
        uint price;
    }
    
    mapping(uint => Product) public products;
    uint public count;
    
    event LogProductAdded(uint id, string name, uint price);
    
    function AppStore () {    
    }
        
    function addProduct(uint id, string name, uint price) fromOwner returns (bool successful) {
        products[id] = Product({
            name: name,
            price: price
        });
        count++;
        LogProductAdded(id, name, price);
        return true;
    }
}