// Found here https://gist.github.com/xavierlepretre/88682e871f4ad07be4534ae560692ee6
web3.eth.getTransactionReceiptMined = function (txnHash, interval) {
  var transactionReceiptAsync;
  interval = interval ? interval : 500;
  transactionReceiptAsync = function(txnHash, resolve, reject) {
    try {
      var receipt = web3.eth.getTransactionReceipt(txnHash);
      if (receipt == null) {
        setTimeout(function () {
          transactionReceiptAsync(txnHash, resolve, reject);
        }, interval);
      } else {
        resolve(receipt);
      }
    } catch(e) {
      reject(e);
    }
  };

  return new Promise(function (resolve, reject) {
      transactionReceiptAsync(txnHash, resolve, reject);
  });
};

// Found here https://gist.github.com/xavierlepretre/afab5a6ca65e0c52eaf902b50b807401
var getEventsPromise = function (myFilter, count) {
  return new Promise(function (resolve, reject) {
    count = count ? count : 1;
    var results = [];
    myFilter.watch(function (error, result) {
      if (error) {
        reject(error);
      } else {
        count--;
        results.push(result);
      }
      if (count <= 0) {
        resolve(results);
        myFilter.stopWatching();
      }
    });
  });
};

var expectedExceptionPromise = function (action, gasToUse) {
  return new Promise(function (resolve, reject) {
      try {
        resolve(action());
      } catch(e) {
        reject(e);
      }
    })
    .then(function (txn) {
      return web3.eth.getTransactionReceiptMined(txn);
    })
    .then(function (receipt) {
      // We are in Geth
      assert.equal(receipt.gasUsed, gasToUse, "should have used all the gas");
    })
    .catch(function (e) {
      if ((e + "").indexOf("invalid JUMP") > -1) {
        // We are in TestRPC
      } else {
        throw e;
      }
    });
};


contract('AppStore', function(accounts) {
  it("should start with empty product list", function() {
    var appStore = AppStore.deployed();

    return appStore.count().then(function(count){
        assert.equal(count.valueOf(),0,"should start with no product")      
    });
  });
    
  it("should not add a product if not owner", function() {
    var appStore = AppStore.deployed();

    return expectedExceptionPromise(function() {
                    return appStore.addProduct.call(1,"shirt",10,
                    {from: accounts[1], gas:3000000} );    
            }, 3000000);
  });
    
  it("should be possible to add a product", function() {
    var appStore = AppStore.deployed();

    return appStore.addProduct.call(1,"shirt",10,{from: accounts[0] })
        .then(function(successful){
        assert.isTrue(successful,"should be possibel to add a product");
        blockNumber = web3.eth.blockNumber + 1;
        return appStore.addProduct(1,"shirt",10,{from: accounts[0] });
        })
        .then(function(txn){
            return Promise.all([ 
                    getEventsPromise(appStore.LogProductAdded(
                    {},
                    {fromBlock: blockNumber, toBlock: "latest" })),
                    web3.eth.getTransactionReceiptMined(txn)
                ]);
        })
        .then(function (eventAndreceipt) {
            //console.log(eventAndreceipt);
            console.log(eventAndreceipt[0][0].args);
            var eventArgs = eventAndreceipt[0][0].args;
            assert.equal(eventArgs.id.valueOf(),1,"should be the product id");
            assert.equal(eventArgs.name,"shirt","should be the product name");
            assert.equal(eventArgs.price.valueOf(),10,"should be the product price");
            return appStore.count();
        }).then(function(count){
            assert.equal(count.valueOf(),1,"should add a product");
            return appStore.products(1);        
        })
        .then(function(values){
              console.log(values);
              assert.equal(values[0],"shirt","should be shirt");
              assert.equal(values[1],10,"should be product price"); 
        });
  });
        

    
    
});