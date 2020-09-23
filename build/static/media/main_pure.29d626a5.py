import smartpy as sp

class WasteToken(sp.Contract):
    def __init__(self, admin):
        self.init(
        paused = False,
        balances = sp.big_map(
            tvalue = sp.TRecord(
                approvals = sp.TMap(
                    sp.TAddress,
                    sp.TNat
                ),
                balance = sp.TNat
            )
        ),
        administrator = admin,
        totalSupply = 0
    )

    @sp.entry_point
    def transfer(self, params):
        sp.set_type(params, sp.TRecord(from_ = sp.TAddress, to_ = sp.TAddress, value = sp.TNat).layout(("from_", ("to_", "value"))))
        sp.verify((sp.sender == self.data.administrator) |
            (~self.data.paused &
                ((params.from_ == sp.sender) |
                 (self.data.balances[params.from_].approvals[sp.sender] >= params.value))))
        self.addAddressIfNecessary(params.to_)
        sp.verify(self.data.balances[params.from_].balance >= params.value)
        self.data.balances[params.from_].balance = sp.as_nat(self.data.balances[params.from_].balance - params.value)
        self.data.balances[params.to_].balance += params.value
        with sp.if_((params.from_ != sp.sender) & (self.data.administrator != sp.sender)):
            self.data.balances[params.from_].approvals[sp.sender] = sp.as_nat(self.data.balances[params.from_].approvals[sp.sender] - params.value)

    @sp.entry_point
    def approve(self, params):
        sp.set_type(params, sp.TRecord(spender = sp.TAddress, value = sp.TNat).layout(("spender", "value")))
        sp.verify(~self.data.paused)
        alreadyApproved = self.data.balances[sp.sender].approvals.get(params.spender, 0)
        sp.verify((alreadyApproved == 0) | (params.value == 0), "UnsafeAllowanceChange")
        self.data.balances[sp.sender].approvals[params.spender] = params.value

    @sp.entry_point
    def setPause(self, params):
        sp.set_type(params, sp.TBool)
        sp.verify(sp.sender == self.data.administrator)
        self.data.paused = params

    @sp.entry_point
    def setAdministrator(self, params):
        sp.set_type(params, sp.TAddress)
        sp.verify(sp.sender == self.data.administrator)
        self.data.administrator = params

    @sp.entry_point
    def mint(self, params):
        sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat))
        sp.verify(sp.sender == self.data.administrator)
        self.addAddressIfNecessary(params.address)
        self.data.balances[params.address].balance += params.value
        self.data.totalSupply += params.value

    @sp.entry_point
    def burn(self, params):
        sp.set_type(params, sp.TRecord(address = sp.TAddress, value = sp.TNat))
        sp.verify(sp.sender == self.data.administrator)
        sp.verify(self.data.balances[params.address].balance >= params.value)
        self.data.balances[params.address].balance = sp.as_nat(self.data.balances[params.address].balance - params.value)
        self.data.totalSupply = sp.as_nat(self.data.totalSupply - params.value)

    def addAddressIfNecessary(self, address):
        with sp.if_(~ self.data.balances.contains(address)):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})

    @sp.entry_point
    def getBalance(self, params):
        self.addAddressIfNecessary(params.owner)
        sp.transfer(self.data.balances[params.owner].balance, sp.tez(0), sp.contract(sp.TNat, params.contractAddress,  entry_point = "viewBalance").open_some())

    @sp.entry_point
    def getAllowance(self, params):
        sp.transfer(self.data.balances[params.owner].approvals[params.spender], sp.tez(0), sp.contract(sp.TNat, params.contractAddress,  entry_point = "viewAllowance").open_some())

    @sp.entry_point
    def getTotalSupply(self, params):
        sp.transfer(self.data.totalSupply, sp.tez(0), sp.contract(sp.TNat, params.target).open_some())

    @sp.entry_point
    def getAdministrator(self, params):
        sp.transfer(self.data.administrator, sp.tez(0), sp.contract(sp.TAddress, params.target).open_some())

class Subscription(sp.Contract):
    def __init__(self,admin,requiredToAddress,requiredTokenAddress,requiredTokenAmount,requiredPeriodSeconds,requiredGasPrice):
        self.init(
            times = sp.big_map(
                tkey = sp.TBytes,
                tvalue = sp.TRecord(
                    nextValidTimeStamp = sp.TTimestamp,
                    ready = sp.TBool,
                    active = sp.TBool
                )
            ),
            extraNonce = sp.map(
                tvalue = sp.TRecord(
                    value = sp.TNat
                )
            ),
            owner = admin,
            balance = 0,
            allowance = 0,
            reqToAddress = requiredToAddress,
            reqTokenAddress = requiredTokenAddress,
            reqTokenAmount = requiredTokenAmount,
            reqPeriodSeconds = requiredPeriodSeconds,
            reqGasPrice = requiredGasPrice
        )
        
    def isSubsActive(self,subHash,graceSecond):
        with sp.if_(self.data.times[subHash].nextValidTimestamp == sp.timestamp(-1)):
            self.data.times[subHash].active = sp.bool(False)
        with sp.else_():
            with sp.if_(sp.now - self.data.times[subHash].nextValidTimestamp.add_seconds(graceSecond)<=0):
                self.data.times[subHash].active = sp.bool(True)
            with sp.else_():
                self.data.times[subHash].active = sp.bool(False)
                
    def addHashIfNecessary(self, subHash):
        with sp.if_(~ self.data.times.contains(subHash)):
            self.data.times[subHash] = sp.record(nextValidTimeStamp = sp.timestamp(-1),ready = sp.bool(False),active = sp.bool(False))
    
    def addAddressIfNecessary(self, address):
        with sp.if_(~ self.data.extraNonce.contains(address)):
            self.data.extraNonce[address] = sp.record(value = 0)
            
    @sp.entry_point        
    def updateBalance(self,params):
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, tokenAddress = sp.TAddress).layout(("subscriber","tokenAddress")))
        c = sp.contract(
            sp.TRecord(
                owner = sp.TAddress,
                contractAddress = sp.TAddress
            ),
            params.tokenAddress,
            entry_point ="getBalance"
        ).open_some()
        trans = sp.record(owner = params.subscriber,contractAddress = sp.to_address(sp.self))
        sp.transfer(trans,sp.mutez(0),c)
    
    @sp.entry_point    
    def updateAllowance(self,params):
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, spender = sp.TAddress, tokenAddress = sp.TAddress).layout(("spender",("subscriber","tokenAddress"))))
        c = sp.contract(
            sp.TRecord(
                owner = sp.TAddress,
                spender = sp.TAddress,
                contractAddress = sp.TAddress
            ),
            params.tokenAddress,
            entry_point ="getAllowance"
        ).open_some()
        trans = sp.record(owner = params.subscriber,spender = params.spender,contractAddress = sp.to_address(sp.self))
        sp.transfer(trans,sp.mutez(0),c)
        
    def getHash(self,params):
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, nonce = sp.TNat).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice","nonce"))))))))
        sp.verify((~self.data.reqToAddress.is_some()) | ( (self.data.reqToAddress.is_some()) & (self.data.reqToAddress.open_some() == params.publisher)) )
        sp.verify((~self.data.reqTokenAddress.is_some()) | ( (self.data.reqTokenAddress.is_some()) & (self.data.reqTokenAddress.open_some() == params.tokenAddress)) )
        sp.verify((~self.data.reqTokenAmount.is_some()) | ( (self.data.reqTokenAmount.is_some()) & (self.data.reqTokenAmount.open_some() == params.tokenAmount)) )
        sp.verify((~self.data.reqPeriodSeconds.is_some()) | ( (self.data.reqPeriodSeconds.is_some()) & (self.data.reqPeriodSeconds.open_some() == params.periodSeconds)) )
        sp.verify((~self.data.reqGasPrice.is_some()) | ( (self.data.reqGasPrice.is_some()) & (self.data.reqGasPrice.open_some() == params.gasPrice)) )
        
        return sp.pack(
            sp.record(
                a = params.subscriber,
                b = params.publisher,
                c = params.tokenAddress,
                d = params.tokenAmount,
                e = params.periodSeconds,
                f = params.gasPrice,
                g = params.nonce,
            )
        )
            
            
    def isSubsReady(self,params):
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, nonce = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("nonce", ("userSignature","subs_pub_key"))))))))))
        element = sp.local('element',self.getHash( 
            sp.record(
                subscriber = params.subscriber,
                publisher = params.publisher,
                tokenAddress = params.tokenAddress,
                tokenAmount = params.tokenAmount,
                periodSeconds = params.periodSeconds,
                gasPrice = params.gasPrice,
                nonce = params.nonce
            )
        ))
        self.addHashIfNecessary(element.value)
        self.data.times[element.value].ready = sp.bool(False)
        sp.verify(sp.check_signature(params.subs_pub_key, params.userSignature,element.value))
        sp.verify(params.subscriber != params.publisher)
        sp.verify(sp.now >= self.data.times[element.value].nextValidTimeStamp)
        self.data.times[element.value].ready = sp.bool(True)
            
    @sp.entry_point
    def viewBalance(self,params):
        sp.set_type(params, sp.TNat)
        self.data.balance = params
    
    @sp.entry_point
    def viewAllowance(self,params):
        sp.set_type(params, sp.TNat)
        self.data.allowance = params
    
    @sp.entry_point
    def executeSubs(self,params):   
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, nonce = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("nonce", ("userSignature","subs_pub_key"))))))))))
        elements = sp.local('elements',self.getHash( sp.record(
                subscriber = params.subscriber,
                publisher = params.publisher,
                tokenAddress = params.tokenAddress,
                tokenAmount = params.tokenAmount,
                periodSeconds = params.periodSeconds,
                gasPrice = params.gasPrice,
                nonce = params.nonce
            )
        ))
        self.isSubsReady(sp.record(
                subscriber = params.subscriber,
                publisher = params.publisher,
                tokenAddress = params.tokenAddress,
                tokenAmount = params.tokenAmount,
                periodSeconds = params.periodSeconds,
                gasPrice = params.gasPrice,
                nonce = params.nonce,
                userSignature = params.userSignature,
                subs_pub_key = params.subs_pub_key
            )
        )
        sp.verify(self.data.times[elements.value].ready == sp.bool(True))
        self.data.times[elements.value].nextValidTimeStamp = sp.now.add_seconds(params.periodSeconds)
        self.addAddressIfNecessary(params.subscriber)
        with sp.if_(params.nonce > self.data.extraNonce[params.subscriber].value):
            self.data.extraNonce[params.subscriber].value = params.nonce
        
        c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),params.tokenAddress,entry_point ="transfer").open_some()
        trans = sp.record(from_ = params.subscriber, to_ = params.publisher,value = params.tokenAmount)
        sp.transfer(trans,sp.mutez(0),c)
    
        with sp.if_(params.gasPrice>0):
                c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),params.tokenAddress,entry_point ="transfer").open_some()
                trans = sp.record(from_ = params.subscriber, to_ = sp.sender,value = params.gasPrice)
                sp.transfer(trans,sp.mutez(0),c)
                
    @sp.entry_point          
    def cancelSub(self,params):
        sp.set_type(params, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat,nonce = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("nonce", ("userSignature","subs_pub_key"))))))))))
        elements = sp.local('elements',self.getHash( sp.record(
                subscriber = params.subscriber,
                publisher = params.publisher,
                tokenAddress = params.tokenAddress,
                tokenAmount = params.tokenAmount,
                periodSeconds = params.periodSeconds,
                gasPrice = params.gasPrice,
                nonce = params.nonce
            )
        ))
        sp.verify(sp.check_signature(params.subs_pub_key, params.userSignature,elements.value))
        sp.verify(sp.sender==params.subscriber)
        self.data.times[elements.value].nextValidTimeStamp = sp.timestamp(-1)
        

if "templates" not in __name__:
    @sp.add_test(name = "Subscription")
    def test():

        scenario = sp.test_scenario()
        scenario.h1("Subscription based Token")

        scenario.table_of_contents()

        # sp.test_account generates ED25519 key-pairs deterministically:
        admin = sp.test_account("Administrator")
        alice = sp.test_account("Alice")
        bob   = sp.test_account("Robert")
        
        # Let's display the accounts:
        scenario.h1("Accounts")
        scenario.show([admin, alice, bob])

        scenario.h1("Contract")
        c1 = Subscription(admin.address,sp.none,sp.none,sp.none,sp.none,sp.none)
        c2 = WasteToken(admin.address)
        
        scenario.h1("Entry points")
        message_subs = sp.pack(
            sp.record(
                a = alice.address,
                b = admin.address,
                c = bob.address,
                d = 1,
                e = 60,
                f = 0,
                g = 0
            )
        )
    
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs,
                                       message_format = "Raw")
                                       
        
        scenario += c2
        scenario += c1 

        
        message_subs_alice = sp.pack(sp.record(a = alice.address, b = admin.address, c = c2.address, d = 100, e = 60, f = 0, g = 1))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")                               
        
        scenario.h1("Test 1")
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 1200).run(sender = alice)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 0,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 0,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True,now = 60)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 0,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True,sender = alice)
        
        
        
        scenario.h1("Test 2")
        message_subs_alice = sp.pack(sp.record(a = alice.address, b = admin.address, c = c2.address, d = 100, e = 60, f = 5, g = 1))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 5,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 5,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True,now = 120)
        
        scenario.h2("Update Balance")
        scenario += c1.updateBalance(params = sp.record(subscriber = alice.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Update Allowance")
        scenario += c1.updateAllowance(params = sp.record(subscriber = alice.address,spender = c1.address, tokenAddress = c2.address)).run(valid=True)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(params = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 5,nonce = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key)).run(valid = True,sender = alice)
        
