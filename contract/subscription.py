import smartpy as sp

class FA12(sp.Contract):
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
        sp.if (params.from_ != sp.sender) & (self.data.administrator != sp.sender):
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
        sp.if ~ self.data.balances.contains(address):
            self.data.balances[address] = sp.record(balance = 0, approvals = {})

    @sp.entry_point
    def getBalance(self, params):
        sp.transfer(self.data.balances[params.arg.owner].balance, sp.tez(0), sp.contract(sp.TNat, params.target).open_some())

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
    def __init__(self,admin):
        self.init(
            times = sp.big_map(
                tkey = sp.TBytes,
                tvalue = sp.TRecord(
                    nextValidTimeStamp = sp.TTimestamp,
                    publishSign = sp.TBool,
                    active = sp.TBool,
                    ready = sp.TBool
                )
            ),
            owner = admin,
            allowance = 0
        )

            
    def addHashIfNecessary(self, subHash):
        sp.set_type(subHash,sp.TBytes)
        sp.if ~self.data.times.contains(subHash):
            self.data.times[subHash] = sp.record(nextValidTimeStamp = sp.timestamp(-1),publishSign = sp.bool(False),active = sp.bool(False),ready = sp.bool(False))

    @sp.entry_point
    def signHash(self, subHash):
        sp.verify(sp.sender==self.data.owner)
        self.addHashIfNecessary(subHash)
        self.data.times[subHash].publishSign = sp.bool(True)
        
    def isSubsActive(self,subHash,graceSecond):
        sp.if self.data.times[subHash].nextValidTimestamp == sp.timestamp(-1):
            self.data.times[subHash].active = sp.bool(False)
        sp.else:
            sp.if sp.now - self.data.times[subHash].nextValidTimestamp.add_seconds(graceSecond)<=0:
                self.data.times[subHash].active = sp.bool(True)
            sp.else:
                self.data.times[subHash].active = sp.bool(False)
                
    def viewAllowance(self,params):
        sp.set_type(params, sp.TNat)
        self.data.allowance = params
                
    def isSubsReady(self,params):
        sp.set_type(every, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("userSignature","subs_pub_key")))))))))
        sp.set_type(gasPayer,sp.TOption(sp.TAddress))
        sp.set_type(gasToken,sp.TOption(sp.TAddress))
        elements = sp.local('elements',sp.pack(
                sp.record(
                    s = every.subscriber,
                    p = every.publisher,
                    tA = every.tokenAddress,
                    a = every.tokenAmount,
                    pS = every.periodSeconds,
                    gT = gasToken,
                    gP = every.gasPrice,
                    g = gasPayer
                )
            ))
        self.data.times[elements.value].ready = sp.bool(False)
        sp.verify(sp.check_signature(params.subs_pub_key, params.userSignature,elements.value))
        sp.verify(sp.now >= self.data.times[elements.value].nextValidTimeStamp)
        c = sp.contract(
            sp.TRecord(
                owner = sp.TAddress,
                spender = sp.TAddress,
                contractAddress = sp.TAddress
            ),
            params.tokenAddress,
            entry_point ="getAllowance"
        ).open_some()
        trans = sp.record(owner = params.subscriber,spender = sp.to_address(sp.self),contractAddress = sp.to_address(sp.self))
        sp.transfer(trans,sp.mutez(0),c)
        sp.verify(self.data.allowance >= params.tokenAmount)
        self.data.times[elements.value].ready = sp.bool(True)


    @sp.entry_point
    def executeSubs(self,every,gasPayer,gasToken):   
        sp.set_type(every, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("userSignature","subs_pub_key")))))))))
        sp.set_type(gasPayer,sp.TOption(sp.TAddress))
        sp.set_type(gasToken,sp.TOption(sp.TAddress))
        elements = sp.local('elements',sp.pack(
                sp.record(
                    s = every.subscriber,
                    p = every.publisher,
                    tA = every.tokenAddress,
                    a = every.tokenAmount,
                    pS = every.periodSeconds,
                    gT = gasToken,
                    gP = every.gasPrice,
                    g = gasPayer
                )
            ))
        sp.verify(sp.check_signature(every.subs_pub_key, every.userSignature,elements.value))
        sp.verify(sp.now >= self.data.times[elements.value].nextValidTimeStamp)
        self.data.times[elements.value].nextValidTimeStamp = sp.now.add_seconds(every.periodSeconds)
        c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),every.tokenAddress,entry_point ="transfer").open_some()
        trans = sp.record(from_ = every.subscriber, to_ = every.publisher,value = every.tokenAmount)
        sp.transfer(trans,sp.mutez(0),c)
        sp.if every.gasPrice>0:
            sp.if ~gasToken.is_some():
                sp.verify( (every.subscriber==self.data.owner) | (self.data.times[elements.value].publishSign))
                sp.send(sp.sender,sp.mutez(every.gasPrice))
            sp.else:
                sp.if ~gasPayer.is_some():
                    sp.verify((every.subscriber == self.data.owner) | (self.data.times[elements.value].publishSign))
                    c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),gasToken.open_some(),entry_point ="transfer").open_some()
                    trans = sp.record(from_ = sp.to_address(sp.self), to_ = sp.sender,value = every.gasPrice)
                    sp.transfer(trans,sp.mutez(0),c)
                sp.else:
                    sp.if gasPayer.open_some() == sp.to_address(sp.self):
                        sp.verify((every.subscriber==self.data.owner) | (self.data.times[elements.value].publishSign))
                        c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),gasToken.open_some(),entry_point ="transfer").open_some()
                        trans = sp.record(from_ = sp.to_address(sp.self), to_ = sp.sender,value = every.gasPrice)
                        sp.transfer(trans,sp.mutez(0),c)
                    sp.else:
                        sp.if gasPayer.open_some() == every.subscriber:
                            c = sp.contract(sp.TRecord(from_ = sp.TAddress,to_ = sp.TAddress, value = sp.TNat),gasToken.open_some(),entry_point ="transfer").open_some()
                            trans = sp.record(from_ = every.subscriber, to_ = sp.sender,value = every.gasPrice)
                            sp.transfer(trans,sp.mutez(0),c)
    
    @sp.entry_point          
    def cancelSub(self,every,gasPayer,gasToken):
        sp.set_type(every, sp.TRecord(subscriber = sp.TAddress, publisher = sp.TAddress, tokenAddress = sp.TAddress, tokenAmount = sp.TNat, periodSeconds = sp.TInt, gasPrice = sp.TNat, userSignature = sp.TSignature, subs_pub_key = sp.TKey).layout(("subscriber",("publisher",("tokenAddress",("tokenAmount",("periodSeconds", ("gasPrice",("userSignature","subs_pub_key")))))))))
        sp.set_type(gasPayer,sp.TOption(sp.TAddress))
        sp.set_type(gasToken,sp.TOption(sp.TAddress))
        elements = sp.local('elements',sp.pack(
                sp.record(
                    s = every.subscriber,
                    p = every.publisher,
                    tA = every.tokenAddress,
                    a = every.tokenAmount,
                    pS = every.periodSeconds,
                    gT = gasToken,
                    gP = every.gasPrice,
                    g = gasPayer
                )
            ))
        
        sp.verify(sp.check_signature(every.subs_pub_key, every.userSignature,elements.value))
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
        c1 = Subscription(admin.address)
        c2 = FA12(admin.address)
        
        scenario.h1("Entry points")
        scenario += c2
        scenario += c1

        #
        message_subs_alice = sp.pack(sp.record(s = alice.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = sp.none, gP = 0, g = sp.none))
        message_subs_bob = sp.pack(sp.record(s = bob.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = sp.none, gP = 0, g = sp.none))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        sig_from_bob = sp.make_signature(secret_key = bob.secret_key,
                                       message =  message_subs_bob,
                                       message_format = "Raw")                               
        scenario.h2("Sign Message Hash")
        scenario += c1.signHash(message_subs_alice).run(sender = admin)
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 12).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 12).run(sender = alice)
        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 1, periodSeconds = 60, gasPrice = 0, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.none).run(valid = True)
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 1, periodSeconds = 60, gasPrice = 0, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.none).run(valid = True,now = 60)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 1, periodSeconds = 60, gasPrice = 0, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.none).run(valid = True)
        #

        # 
        message_subs_alice = sp.pack(sp.record(s = alice.address, p = admin.address, tA = c2.address, a = 100, pS = 60, gT = sp.some(c2.address), gP = 1, g = sp.some(alice.address)))
        message_subs_bob = sp.pack(sp.record(s = bob.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = sp.none, gP = 0, g = sp.none))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        sig_from_bob = sp.make_signature(secret_key = bob.secret_key,
                                       message =  message_subs_bob,
                                       message_format = "Raw")                               
        scenario.h2("Sign Message Hash")
        scenario += c1.signHash(message_subs_alice).run(sender = admin)
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 1200).run(sender = alice)
        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(alice.address),gasToken= sp.some(c2.address)).run(valid = True)
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(alice.address),gasToken= sp.some(c2.address)).run(valid = True,now = 60)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(alice.address),gasToken= sp.some(c2.address)).run(valid = True)
        #


        #
        message_subs_alice = sp.pack(sp.record(s = alice.address, p = admin.address, tA = c2.address, a = 100, pS = 60, gT = sp.none, gP = 1, g = sp.none))
        message_subs_bob = sp.pack(sp.record(s = bob.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = sp.none, gP = 0, g = sp.none))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        sig_from_bob = sp.make_signature(secret_key = bob.secret_key,
                                       message =  message_subs_bob,
                                       message_format = "Raw")                               
        scenario.h2("Sign Message Hash")
        scenario += c1.signHash(message_subs_alice).run(sender = admin)
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 1200).run(sender = alice)
        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken=sp.none).run(valid = True)
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.none).run(valid = True,now = 60)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.none).run(valid = True)
        #

        #
        message_subs_alice = sp.pack(sp.record(s = alice.address, p = admin.address, tA = c2.address, a = 100, pS = 60, gT = sp.some(c2.address), gP = 1, g = sp.some(c1.address)))
        message_subs_bob = sp.pack(sp.record(s = bob.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = c2.address, gP = 0, g = c1.address))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        sig_from_bob = sp.make_signature(secret_key = bob.secret_key,
                                       message =  message_subs_bob,
                                       message_format = "Raw")                               
        scenario.h2("Sign Message Hash")
        scenario += c1.signHash(message_subs_alice).run(sender = admin)
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Mint for Contract")
        scenario += c2.mint(address = c1.address, value = 1200).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 1200).run(sender = alice)

        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(c1.address),gasToken= sp.some(c2.address)).run(valid = True)
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(c1.address),gasToken= sp.some(c2.address)).run(valid = True,now = 60)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.some(c1.address),gasToken= sp.some(c2.address)).run(valid = True)
        #

        #
        message_subs_alice = sp.pack(sp.record(s = alice.address, p = admin.address, tA = c2.address, a = 100, pS = 60, gT = sp.some(c2.address), gP = 1, g = sp.none))
        message_subs_bob = sp.pack(sp.record(s = bob.address, p = admin.address, tA = c2.address, a = 1, pS = 60, gT = c2.address, gP = 0, g = c1.address))
        sig_from_alice = sp.make_signature(secret_key = alice.secret_key,
                                       message =  message_subs_alice,
                                       message_format = "Raw")
        sig_from_bob = sp.make_signature(secret_key = bob.secret_key,
                                       message =  message_subs_bob,
                                       message_format = "Raw")                               
        scenario.h2("Sign Message Hash")
        scenario += c1.signHash(message_subs_alice).run(sender = admin)
        
        scenario.h2("Mint for Alice First")
        scenario += c2.mint(address = alice.address, value = 1200).run(sender = admin)
        
        scenario.h2("Mint for Contract")
        scenario += c2.mint(address = c1.address, value = 1200).run(sender = admin)
        
        scenario.h2("Approve First")
        scenario += c2.approve(spender = c1.address, value = 1200).run(sender = alice)

        
        scenario.h2("Execute Subscription")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.some(c2.address)).run(valid = True)
       
        scenario.h2("Execute Subscription - 2")
        scenario += c1.executeSubs(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.some(c2.address)).run(valid = True,now = 60)
        
        scenario.h2("Cancel Subscription")
        scenario += c1.cancelSub(every = sp.record(subscriber = alice.address, publisher = admin.address, tokenAddress = c2.address, tokenAmount = 100, periodSeconds = 60, gasPrice = 1, userSignature = sig_from_alice, subs_pub_key = alice.public_key), gasPayer = sp.none,gasToken= sp.some(c2.address)).run(valid = True)
        #