[{"shortname": "Subscription", "longname": "Subscription", "scenario": [{"action": "html", "tag": "h1", "inner": "Subscription based Token", "line_no": 281}, {"action": "html", "tag": "p", "inner": "[[TABLEOFCONTENTS]]", "line_no": 283}, {"action": "html", "tag": "h1", "inner": "Accounts", "line_no": 291}, {"action": "show", "html": true, "stripStrings": false, "expression": "(list 292 (account_of_seed \"Administrator\" 286) (account_of_seed \"Alice\" 287) (account_of_seed \"Robert\" 288))", "line_no": 292}, {"action": "html", "tag": "h1", "inner": "Contract", "line_no": 294}, {"action": "html", "tag": "h1", "inner": "Entry points", "line_no": 298}, {"action": "newContract", "id": 1, "export": "(storage (record 5 (administrator (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (balances (type_annotation (big_map 7 ) (bigmap (unknown 9) (record ((approvals (map \"address\" \"nat\")) (balance \"nat\")) None)) 7)) (paused (literal (bool False) 5)) (totalSupply (literal (intOrNat 0) 5)))\nstorage_type (())\nmessages ((approve True ((set_type (params 35) (record ((spender \"address\") (value \"nat\")) (Some ((\"spender\") (\"value\")))) 36) (verify (invert (attr (data) \"paused\" 37) 37) False 37) (verify (or (eq (getItemDefault (attr (getItem (attr (data) \"balances\" 38) (sender) 38) \"approvals\" 38) (attr (params 35) \"spender\" 38) (literal (intOrNat 0) 38) 38) (literal (intOrNat 0) 39) 39) (eq (attr (params 35) \"value\" 39) (literal (intOrNat 0) 39) 39) 39) \"UnsafeAllowanceChange\" 39) (set (getItem (attr (getItem (attr (data) \"balances\" 38) (sender) 40) \"approvals\" 40) (attr (params 35) \"spender\" 38) 40) (attr (params 35) \"value\" 39) 40))) (burn True ((set_type (params 63) (record ((address \"address\") (value \"nat\")) None) 64) (verify (eq (sender) (attr (data) \"administrator\" 65) 65) False 65) (verify (ge (attr (getItem (attr (data) \"balances\" 38) (attr (params 63) \"address\" 66) 66) \"balance\" 66) (attr (params 63) \"value\" 66) 66) False 66) (set (attr (getItem (attr (data) \"balances\" 38) (attr (params 63) \"address\" 66) 67) \"balance\" 67) (openVariant (isNat (sub (attr (getItem (attr (data) \"balances\" 38) (attr (params 63) \"address\" 66) 67) \"balance\" 67) (attr (params 63) \"value\" 66) 67) 67) \"Some\" 67) 67) (set (attr (data) \"totalSupply\" 68) (openVariant (isNat (sub (attr (data) \"totalSupply\" 68) (attr (params 63) \"value\" 66) 68) 68) \"Some\" 68) 68))) (getAdministrator True ((set (operations 89) (cons (transfer (attr (data) \"administrator\" 65) (literal (mutez 0) 89) (openVariant (contract \"\" \"address\" (attr (params 88) \"target\" 89) 89) \"Some\" 89) 89) (operations 89) 89) 89))) (getAllowance True ((set (operations 81) (cons (transfer (getItem (attr (getItem (attr (data) \"balances\" 38) (attr (params 80) \"owner\" 81) 81) \"approvals\" 81) (attr (params 80) \"spender\" 81) 81) (literal (mutez 0) 81) (openVariant (contract \"viewAllowance\" \"nat\" (attr (params 80) \"contractAddress\" 81) 81) \"Some\" 81) 81) (operations 81) 81) 81))) (getBalance True ((ifBlock (invert (contains (attr (data) \"balances\" 38) (attr (params 75) \"owner\" 76) 71) 71) ((set (getItem (attr (data) \"balances\" 38) (attr (params 75) \"owner\" 76) 72) (record 72 (approvals (map 72 )) (balance (literal (intOrNat 0) 72))) 72)) 71) (set (operations 77) (cons (transfer (attr (getItem (attr (data) \"balances\" 38) (attr (params 75) \"owner\" 76) 77) \"balance\" 77) (literal (mutez 0) 77) (openVariant (contract \"viewBalance\" \"nat\" (attr (params 75) \"contractAddress\" 77) 77) \"Some\" 77) 77) (operations 77) 77) 77))) (getTotalSupply True ((set (operations 85) (cons (transfer (attr (data) \"totalSupply\" 68) (literal (mutez 0) 85) (openVariant (contract \"\" \"nat\" (attr (params 84) \"target\" 85) 85) \"Some\" 85) 85) (operations 85) 85) 85))) (mint True ((set_type (params 55) (record ((address \"address\") (value \"nat\")) None) 56) (verify (eq (sender) (attr (data) \"administrator\" 65) 57) False 57) (ifBlock (invert (contains (attr (data) \"balances\" 38) (attr (params 55) \"address\" 58) 71) 71) ((set (getItem (attr (data) \"balances\" 38) (attr (params 55) \"address\" 58) 72) (record 72 (approvals (map 72 )) (balance (literal (intOrNat 0) 72))) 72)) 71) (set (attr (getItem (attr (data) \"balances\" 38) (attr (params 55) \"address\" 58) 59) \"balance\" 59) (add (attr (getItem (attr (data) \"balances\" 38) (attr (params 55) \"address\" 58) 59) \"balance\" 59) (attr (params 55) \"value\" 59) 59) 59) (set (attr (data) \"totalSupply\" 68) (add (attr (data) \"totalSupply\" 68) (attr (params 55) \"value\" 59) 60) 60))) (setAdministrator True ((set_type (params 49) \"address\" 50) (verify (eq (sender) (attr (data) \"administrator\" 65) 51) False 51) (set (attr (data) \"administrator\" 65) (params 49) 52))) (setPause True ((set_type (params 43) \"bool\" 44) (verify (eq (sender) (attr (data) \"administrator\" 65) 45) False 45) (set (attr (data) \"paused\" 37) (params 43) 46))) (transfer True ((set_type (params 21) (record ((from_ \"address\") (to_ \"address\") (value \"nat\")) (Some ((\"from_\") ((\"to_\") (\"value\"))))) 22) (verify (or (eq (sender) (attr (data) \"administrator\" 65) 23) (and (invert (attr (data) \"paused\" 37) 24) (or (eq (attr (params 21) \"from_\" 25) (sender) 25) (ge (getItem (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 26) \"approvals\" 26) (sender) 26) (attr (params 21) \"value\" 26) 26) 25) 24) 23) False 23) (ifBlock (invert (contains (attr (data) \"balances\" 38) (attr (params 21) \"to_\" 27) 71) 71) ((set (getItem (attr (data) \"balances\" 38) (attr (params 21) \"to_\" 27) 72) (record 72 (approvals (map 72 )) (balance (literal (intOrNat 0) 72))) 72)) 71) (verify (ge (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 28) \"balance\" 28) (attr (params 21) \"value\" 26) 28) False 28) (set (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 29) \"balance\" 29) (openVariant (isNat (sub (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 29) \"balance\" 29) (attr (params 21) \"value\" 26) 29) 29) \"Some\" 29) 29) (set (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"to_\" 27) 30) \"balance\" 30) (add (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"to_\" 27) 30) \"balance\" 30) (attr (params 21) \"value\" 26) 30) 30) (ifBlock (and (neq (attr (params 21) \"from_\" 25) (sender) 31) (neq (attr (data) \"administrator\" 65) (sender) 31) 31) ((set (getItem (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 32) \"approvals\" 32) (sender) 32) (openVariant (isNat (sub (getItem (attr (getItem (attr (data) \"balances\" 38) (attr (params 21) \"from_\" 25) 32) \"approvals\" 32) (sender) 32) (attr (params 21) \"value\" 26) 32) 32) \"Some\" 32) 32)) 31))))\nflags ()\nglobals ()\nstorage_layout ()\nentry_points_layout ())", "line_no": 313, "show": true, "accept_unknown_types": false}, {"action": "newContract", "id": 0, "export": "(storage (record 93 (allowance (literal (intOrNat 0) 93)) (balance (literal (intOrNat 0) 93)) (extraNonce (type_annotation (map 102 ) (map (unknown 5) (record ((value \"nat\")) None)) 102)) (owner (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (reqGasPrice (variant \"None\" (unit) -1)) (reqPeriodSeconds (variant \"None\" (unit) -1)) (reqToAddress (variant \"None\" (unit) -1)) (reqTokenAddress (variant \"None\" (unit) -1)) (reqTokenAmount (variant \"None\" (unit) -1)) (times (type_annotation (big_map 94 ) (bigmap \"bytes\" (record ((active \"bool\") (nextValidTimeStamp \"timestamp\") (ready \"bool\")) None)) 94)))\nstorage_type (())\nmessages ((cancelSub True ((set_type (params 259) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subs_pub_key \"key\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\") (userSignature \"signature\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") ((\"nonce\") ((\"userSignature\") (\"subs_pub_key\"))))))))))) 260) (set_type (record 261 (gasPrice (attr (params 259) \"gasPrice\" 267)) (nonce (attr (params 259) \"nonce\" 268)) (periodSeconds (attr (params 259) \"periodSeconds\" 266)) (publisher (attr (params 259) \"publisher\" 263)) (subscriber (attr (params 259) \"subscriber\" 262)) (tokenAddress (attr (params 259) \"tokenAddress\" 264)) (tokenAmount (attr (params 259) \"tokenAmount\" 265))) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") (\"nonce\"))))))))) 165) (verify (or (invert (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) 166) (and (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (eq (openVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (attr (params 259) \"publisher\" 263) 166) 166) 166) False 166) (verify (or (invert (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) 167) (and (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (eq (openVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (attr (params 259) \"tokenAddress\" 264) 167) 167) 167) False 167) (verify (or (invert (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) 168) (and (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (eq (openVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (attr (params 259) \"tokenAmount\" 265) 168) 168) 168) False 168) (verify (or (invert (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) 169) (and (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (eq (openVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (attr (params 259) \"periodSeconds\" 266) 169) 169) 169) False 169) (verify (or (invert (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) 170) (and (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (eq (openVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (attr (params 259) \"gasPrice\" 267) 170) 170) 170) False 170) (defineLocal \"elements\" (pack (record 173 (a (attr (params 259) \"tokenAmount\" 265)) (gP (attr (params 259) \"gasPrice\" 267)) (n (attr (params 259) \"nonce\" 268)) (p (attr (params 259) \"publisher\" 263)) (pS (attr (params 259) \"periodSeconds\" 266)) (s (attr (params 259) \"subscriber\" 262)) (tA (attr (params 259) \"tokenAddress\" 264))) 172) 261) (verify (check_signature (attr (params 259) \"subs_pub_key\" 271) (attr (params 259) \"userSignature\" 271) (getLocal \"elements\" 271) 271) False 271) (verify (eq (sender) (attr (params 259) \"subscriber\" 262) 272) False 272) (set (attr (getItem (attr (data) \"times\" 273) (getLocal \"elements\" 273) 273) \"nextValidTimeStamp\" 273) (literal (timestamp -1) 273) 273))) (executeSubs True ((set_type (params 219) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subs_pub_key \"key\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\") (userSignature \"signature\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") ((\"nonce\") ((\"userSignature\") (\"subs_pub_key\"))))))))))) 220) (set_type (record 221 (gasPrice (attr (params 219) \"gasPrice\" 227)) (nonce (attr (params 219) \"nonce\" 228)) (periodSeconds (attr (params 219) \"periodSeconds\" 226)) (publisher (attr (params 219) \"publisher\" 223)) (subscriber (attr (params 219) \"subscriber\" 222)) (tokenAddress (attr (params 219) \"tokenAddress\" 224)) (tokenAmount (attr (params 219) \"tokenAmount\" 225))) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") (\"nonce\"))))))))) 165) (verify (or (invert (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) 166) (and (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (eq (openVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (attr (params 219) \"publisher\" 223) 166) 166) 166) False 166) (verify (or (invert (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) 167) (and (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (eq (openVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (attr (params 219) \"tokenAddress\" 224) 167) 167) 167) False 167) (verify (or (invert (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) 168) (and (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (eq (openVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (attr (params 219) \"tokenAmount\" 225) 168) 168) 168) False 168) (verify (or (invert (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) 169) (and (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (eq (openVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (attr (params 219) \"periodSeconds\" 226) 169) 169) 169) False 169) (verify (or (invert (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) 170) (and (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (eq (openVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (attr (params 219) \"gasPrice\" 227) 170) 170) 170) False 170) (defineLocal \"elements\" (pack (record 173 (a (attr (params 219) \"tokenAmount\" 225)) (gP (attr (params 219) \"gasPrice\" 227)) (n (attr (params 219) \"nonce\" 228)) (p (attr (params 219) \"publisher\" 223)) (pS (attr (params 219) \"periodSeconds\" 226)) (s (attr (params 219) \"subscriber\" 222)) (tA (attr (params 219) \"tokenAddress\" 224))) 172) 221) (set_type (record 231 (gasPrice (attr (params 219) \"gasPrice\" 227)) (nonce (attr (params 219) \"nonce\" 228)) (periodSeconds (attr (params 219) \"periodSeconds\" 226)) (publisher (attr (params 219) \"publisher\" 223)) (subs_pub_key (attr (params 219) \"subs_pub_key\" 240)) (subscriber (attr (params 219) \"subscriber\" 222)) (tokenAddress (attr (params 219) \"tokenAddress\" 224)) (tokenAmount (attr (params 219) \"tokenAmount\" 225)) (userSignature (attr (params 219) \"userSignature\" 239))) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subs_pub_key \"key\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\") (userSignature \"signature\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") ((\"nonce\") ((\"userSignature\") (\"subs_pub_key\"))))))))))) 186) (set_type (record 188 (gasPrice (attr (params 219) \"gasPrice\" 227)) (nonce (attr (params 219) \"nonce\" 228)) (periodSeconds (attr (params 219) \"periodSeconds\" 226)) (publisher (attr (params 219) \"publisher\" 223)) (subscriber (attr (params 219) \"subscriber\" 222)) (tokenAddress (attr (params 219) \"tokenAddress\" 224)) (tokenAmount (attr (params 219) \"tokenAmount\" 225))) (record ((gasPrice \"nat\") (nonce \"nat\") (periodSeconds \"int\") (publisher \"address\") (subscriber \"address\") (tokenAddress \"address\") (tokenAmount \"nat\")) (Some ((\"subscriber\") ((\"publisher\") ((\"tokenAddress\") ((\"tokenAmount\") ((\"periodSeconds\") ((\"gasPrice\") (\"nonce\"))))))))) 165) (verify (or (invert (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) 166) (and (isVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (eq (openVariant (attr (data) \"reqToAddress\" 166) \"Some\" 166) (attr (params 219) \"publisher\" 223) 166) 166) 166) False 166) (verify (or (invert (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) 167) (and (isVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (eq (openVariant (attr (data) \"reqTokenAddress\" 167) \"Some\" 167) (attr (params 219) \"tokenAddress\" 224) 167) 167) 167) False 167) (verify (or (invert (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) 168) (and (isVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (eq (openVariant (attr (data) \"reqTokenAmount\" 168) \"Some\" 168) (attr (params 219) \"tokenAmount\" 225) 168) 168) 168) False 168) (verify (or (invert (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) 169) (and (isVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (eq (openVariant (attr (data) \"reqPeriodSeconds\" 169) \"Some\" 169) (attr (params 219) \"periodSeconds\" 226) 169) 169) 169) False 169) (verify (or (invert (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) 170) (and (isVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (eq (openVariant (attr (data) \"reqGasPrice\" 170) \"Some\" 170) (attr (params 219) \"gasPrice\" 227) 170) 170) 170) False 170) (defineLocal \"element\" (pack (record 173 (a (attr (params 219) \"tokenAmount\" 225)) (gP (attr (params 219) \"gasPrice\" 227)) (n (attr (params 219) \"nonce\" 228)) (p (attr (params 219) \"publisher\" 223)) (pS (attr (params 219) \"periodSeconds\" 226)) (s (attr (params 219) \"subscriber\" 222)) (tA (attr (params 219) \"tokenAddress\" 224))) 172) 187) (ifBlock (invert (contains (attr (data) \"times\" 273) (getLocal \"element\" 198) 127) 127) ((set (getItem (attr (data) \"times\" 273) (getLocal \"element\" 198) 128) (record 128 (active (literal (bool False) 128)) (nextValidTimeStamp (literal (timestamp -1) 128)) (ready (literal (bool False) 128))) 128)) 127) (set (attr (getItem (attr (data) \"times\" 273) (getLocal \"element\" 199) 199) \"ready\" 199) (literal (bool False) 199) 199) (verify (check_signature (attr (params 219) \"subs_pub_key\" 240) (attr (params 219) \"userSignature\" 239) (getLocal \"element\" 200) 200) False 200) (verify (neq (attr (params 219) \"subscriber\" 222) (attr (params 219) \"publisher\" 223) 201) False 201) (verify (ge (now) (attr (getItem (attr (data) \"times\" 273) (getLocal \"element\" 202) 202) \"nextValidTimeStamp\" 202) 202) False 202) (verify (ge (attr (data) \"allowance\" 203) (add (attr (params 219) \"tokenAmount\" 225) (attr (params 219) \"gasPrice\" 227) 203) 203) False 203) (verify (ge (attr (data) \"balance\" 204) (add (attr (params 219) \"tokenAmount\" 225) (attr (params 219) \"gasPrice\" 227) 204) 204) False 204) (set (attr (getItem (attr (data) \"times\" 273) (getLocal \"element\" 205) 205) \"ready\" 205) (literal (bool True) 205) 205) (verify (eq (attr (getItem (attr (data) \"times\" 273) (getLocal \"elements\" 243) 243) \"ready\" 243) (literal (bool True) 243) 243) False 243) (set (attr (getItem (attr (data) \"times\" 273) (getLocal \"elements\" 244) 244) \"nextValidTimeStamp\" 244) (add_seconds (now) (attr (params 219) \"periodSeconds\" 226) 244) 244) (ifBlock (invert (contains (attr (data) \"extraNonce\" 131) (attr (params 219) \"subscriber\" 222) 131) 131) ((set (getItem (attr (data) \"extraNonce\" 131) (attr (params 219) \"subscriber\" 222) 132) (record 132 (value (literal (intOrNat 0) 132))) 132)) 131) (ifBlock (gt (attr (params 219) \"nonce\" 228) (attr (getItem (attr (data) \"extraNonce\" 131) (attr (params 219) \"subscriber\" 222) 246) \"value\" 246) 246) ((set (attr (getItem (attr (data) \"extraNonce\" 131) (attr (params 219) \"subscriber\" 222) 247) \"value\" 247) (attr (params 219) \"nonce\" 228) 247)) 246) (set (operations 251) (cons (transfer (record 250 (from_ (attr (params 219) \"subscriber\" 222)) (to_ (attr (params 219) \"publisher\" 223)) (value (attr (params 219) \"tokenAmount\" 225))) (literal (mutez 0) 251) (openVariant (contract \"transfer\" (record ((from_ \"address\") (to_ \"address\") (value \"nat\")) None) (attr (params 219) \"tokenAddress\" 224) 249) \"Some\" 249) 251) (operations 251) 251) 251) (ifBlock (gt (attr (params 219) \"gasPrice\" 227) (literal (intOrNat 0) 253) 253) ((set (operations 256) (cons (transfer (record 255 (from_ (attr (params 219) \"subscriber\" 222)) (to_ (sender)) (value (attr (params 219) \"gasPrice\" 227))) (literal (mutez 0) 256) (openVariant (contract \"transfer\" (record ((from_ \"address\") (to_ \"address\") (value \"nat\")) None) (attr (params 219) \"tokenAddress\" 224) 254) \"Some\" 254) 256) (operations 256) 256) 256)) 253))) (updateAllowance True ((set_type (params 149) (record ((spender \"address\") (subscriber \"address\") (tokenAddress \"address\")) (Some ((\"spender\") ((\"subscriber\") (\"tokenAddress\"))))) 150) (set (operations 161) (cons (transfer (record 160 (contractAddress (to_address (self) 160)) (owner (attr (params 149) \"subscriber\" 160)) (spender (attr (params 149) \"spender\" 160))) (literal (mutez 0) 161) (openVariant (contract \"getAllowance\" (record ((contractAddress \"address\") (owner \"address\") (spender \"address\")) None) (attr (params 149) \"tokenAddress\" 157) 151) \"Some\" 151) 161) (operations 161) 161) 161))) (updateBalance True ((set_type (params 135) (record ((subscriber \"address\") (tokenAddress \"address\")) (Some ((\"subscriber\") (\"tokenAddress\")))) 136) (set (operations 146) (cons (transfer (record 145 (contractAddress (to_address (self) 145)) (owner (attr (params 135) \"subscriber\" 145))) (literal (mutez 0) 146) (openVariant (contract \"getBalance\" (record ((contractAddress \"address\") (owner \"address\")) None) (attr (params 135) \"tokenAddress\" 142) 137) \"Some\" 137) 146) (operations 146) 146) 146))) (viewAllowance True ((set_type (params 213) \"nat\" 214) (set (attr (data) \"allowance\" 203) (params 213) 215))) (viewBalance True ((set_type (params 208) \"nat\" 209) (set (attr (data) \"balance\" 204) (params 208) 210))))\nflags ()\nglobals ()\nstorage_layout ()\nentry_points_layout ())", "line_no": 314, "show": true, "accept_unknown_types": false}, {"action": "html", "tag": "h1", "inner": "Test 1", "line_no": 322}, {"action": "html", "tag": "h2", "inner": "Mint for Alice First", "line_no": 323}, {"action": "message", "id": 1, "message": "mint", "params": "(record 324 (address (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (value (literal (intOrNat 1200) 324)))", "line_no": 324, "title": "", "messageClass": "", "source": "none", "sender": "seed:Administrator", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Approve First", "line_no": 326}, {"action": "message", "id": 1, "message": "approve", "params": "(record 327 (spender (literal (local-address 0) 93)) (value (literal (intOrNat 1200) 327)))", "line_no": 327, "title": "", "messageClass": "", "source": "none", "sender": "seed:Alice", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 329}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 330 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 330, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 332}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 333 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 333, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Execute Subscription", "line_no": 336}, {"action": "message", "id": 0, "message": "executeSubs", "params": "(record 337 (gasPrice (literal (intOrNat 0) 337)) (nonce (literal (intOrNat 1) 337)) (periodSeconds (literal (intOrNat 60) 337)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 337)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 317 (a (literal (intOrNat 100) 317)) (gP (literal (intOrNat 0) 317)) (n (literal (intOrNat 1) 317)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 317)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 317) \"Raw\" 318) 318)))", "line_no": 337, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 339}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 340 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 340, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 342}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 343 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 343, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Execute Subscription - 2", "line_no": 346}, {"action": "message", "id": 0, "message": "executeSubs", "params": "(record 347 (gasPrice (literal (intOrNat 0) 347)) (nonce (literal (intOrNat 1) 347)) (periodSeconds (literal (intOrNat 60) 347)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 347)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 317 (a (literal (intOrNat 100) 317)) (gP (literal (intOrNat 0) 317)) (n (literal (intOrNat 1) 317)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 317)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 317) \"Raw\" 318) 318)))", "line_no": 347, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 349}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 350 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 350, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 352}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 353 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 353, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Cancel Subscription", "line_no": 355}, {"action": "message", "id": 0, "message": "cancelSub", "params": "(record 356 (gasPrice (literal (intOrNat 0) 356)) (nonce (literal (intOrNat 1) 356)) (periodSeconds (literal (intOrNat 60) 356)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 356)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 317 (a (literal (intOrNat 100) 317)) (gP (literal (intOrNat 0) 317)) (n (literal (intOrNat 1) 317)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 317)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 317) \"Raw\" 318) 318)))", "line_no": 356, "title": "", "messageClass": "", "source": "none", "sender": "seed:Alice", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h1", "inner": "Test 2", "line_no": 360}, {"action": "html", "tag": "h2", "inner": "Mint for Alice First", "line_no": 366}, {"action": "message", "id": 1, "message": "mint", "params": "(record 367 (address (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (value (literal (intOrNat 1200) 367)))", "line_no": 367, "title": "", "messageClass": "", "source": "none", "sender": "seed:Administrator", "chain_id": "", "time": 0, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 369}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 370 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 370, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 372}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 373 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 373, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Execute Subscription", "line_no": 376}, {"action": "message", "id": 0, "message": "executeSubs", "params": "(record 377 (gasPrice (literal (intOrNat 5) 377)) (nonce (literal (intOrNat 1) 377)) (periodSeconds (literal (intOrNat 60) 377)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 377)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 361 (a (literal (intOrNat 100) 361)) (gP (literal (intOrNat 5) 361)) (n (literal (intOrNat 1) 361)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 361)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 361) \"Raw\" 362) 362)))", "line_no": 377, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 379}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 380 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 380, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 382}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 383 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 383, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 60, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Execute Subscription - 2", "line_no": 386}, {"action": "message", "id": 0, "message": "executeSubs", "params": "(record 387 (gasPrice (literal (intOrNat 5) 387)) (nonce (literal (intOrNat 1) 387)) (periodSeconds (literal (intOrNat 60) 387)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 387)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 361 (a (literal (intOrNat 100) 361)) (gP (literal (intOrNat 5) 361)) (n (literal (intOrNat 1) 361)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 361)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 361) \"Raw\" 362) 362)))", "line_no": 387, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 120, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Balance", "line_no": 389}, {"action": "message", "id": 0, "message": "updateBalance", "params": "(record 390 (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 390, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 120, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Update Allowance", "line_no": 392}, {"action": "message", "id": 0, "message": "updateAllowance", "params": "(record 393 (spender (literal (local-address 0) 93)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)))", "line_no": 393, "title": "", "messageClass": "", "source": "none", "sender": "none", "chain_id": "", "time": 120, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}, {"action": "html", "tag": "h2", "inner": "Cancel Subscription", "line_no": 395}, {"action": "message", "id": 0, "message": "cancelSub", "params": "(record 396 (gasPrice (literal (intOrNat 5) 396)) (nonce (literal (intOrNat 1) 396)) (periodSeconds (literal (intOrNat 60) 396)) (publisher (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (subs_pub_key (reduce (attr (account_of_seed \"Alice\" 287) \"public_key\" 287) 287)) (subscriber (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tokenAddress (literal (local-address 1) 5)) (tokenAmount (literal (intOrNat 100) 396)) (userSignature (reduce (make_signature (reduce (attr (account_of_seed \"Alice\" 287) \"secret_key\" 287) 287) (pack (record 361 (a (literal (intOrNat 100) 361)) (gP (literal (intOrNat 5) 361)) (n (literal (intOrNat 1) 361)) (p (reduce (attr (account_of_seed \"Administrator\" 286) \"address\" 286) 286)) (pS (literal (intOrNat 60) 361)) (s (reduce (attr (account_of_seed \"Alice\" 287) \"address\" 287) 287)) (tA (literal (local-address 1) 5))) 361) \"Raw\" 362) 362)))", "line_no": 396, "title": "", "messageClass": "", "source": "none", "sender": "seed:Alice", "chain_id": "", "time": 120, "amount": "(literal (mutez 0) 1)", "level": 0, "show": true, "valid": true}]}]