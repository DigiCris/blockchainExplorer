const web3 = new Web3('HTTP://192.168.0.59:7545');
const contentDiv = document.getElementById('content');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');

async function init() {
    const urlParams = new URLSearchParams(window.location.search);
    const txHash = urlParams.get('tx');
    const address = urlParams.get('address');
    const block = urlParams.get('block');

    if (txHash) {
        await displayTransactionDetails(txHash);
    } else if (address) {
        await handleSearch(address);
    } else if(block) {
        await handleSearch(block);
    } else {
        displayWelcomeMessage();
    }

    searchButton.addEventListener('click', () => handleSearch(-1));
}

function displayWelcomeMessage() {
    contentDiv.innerHTML = '<h2>Welcome to the Blockchain Explorer</h2><p>Use the search bar to find information about transactions, blocks, or accounts.</p>';
}

async function handleSearch(searchTerm) {
    
    if(searchTerm==-1) {
        searchTerm = searchInput.value.trim();
    }else {
        searchTerm = searchTerm.trim();
    }
    console.log(searchTerm)
    
    if(searchTerm.startsWith('0x') && searchTerm.length == 42) {
        searchTerm = searchTerm.replace(/^0x/, '');
    }

    if (searchTerm.startsWith('0x') && searchTerm.length === 66) {
        await displayTransactionDetails(searchTerm);
    } else if (!isNaN(searchTerm) && searchTerm !== '') {
        await displayBlockDetails(parseInt(searchTerm));
    } else if (web3.utils.isAddress(searchTerm)) {
        await displayAccountDetails(searchTerm);
    } else {
        contentDiv.innerHTML = '<p>Invalid search term. Please enter a valid transaction hash, block number, or address.</p>';
    }
}

async function displayTransactionDetails(txHash) {
    try {
        const tx = await web3.eth.getTransaction(txHash);
        console.log(tx)
        const receipt = await web3.eth.getTransactionReceipt(txHash);

        contentDiv.innerHTML = `
            <h2>Transaction Details</h2>
            <p><strong>Hash:</strong> <a href="?tx=${tx.hash}">${tx.hash}</a></p>
            <p><strong>Block Hash:</strong> <a href="?block=${tx.blockHash}">${tx.blockHash}</a></p>
            <p><strong>Block Number:</strong> <a href="?block=${tx.blockNumber}">${tx.blockNumber}</a></p>
            <p><strong>Chain ID:</strong> ${tx.chainId}</p>
            <p><strong>From:</strong> <a href="?address=${tx.from}">${tx.from}</a></p>
            <p><strong>To:</strong> <a href="?address=${tx.to}">${tx.to}</a></p>
            <p><strong>Value:</strong> ${web3.utils.fromWei(tx.value, 'ether')} ETH</p>
            <p><strong>Gas:</strong> ${tx.gas}</p>
            <p><strong>Gas Price:</strong> ${web3.utils.fromWei(tx.gasPrice, 'gwei')} Gwei</p>
            <p><strong>Max Fee Per Gas:</strong> ${web3.utils.fromWei(tx.maxFeePerGas, 'gwei')} Gwei</p>
            <p><strong>Max Priority Fee Per Gas:</strong> ${web3.utils.fromWei(tx.maxPriorityFeePerGas, 'gwei')} Gwei</p>
            <p><strong>Nonce:</strong> ${tx.nonce}</p>
            <p><strong>Transaction Index:</strong> ${tx.transactionIndex}</p>
            <p><strong>Type:</strong> ${tx.type}</p>
            <p><strong>Status:</strong> ${receipt.status ? 'Success' : 'Failure'}</p>
            <p><strong>Gas Used:</strong> ${receipt.gasUsed}</p>
            <p><strong>Input:</strong> ${tx.input}</p>
            <p><strong>Signature (r):</strong> ${tx.r}</p>
            <p><strong>Signature (s):</strong> ${tx.s}</p>
            <p><strong>Signature (v):</strong> ${tx.v}</p>
        `;
    } catch (error) {
        contentDiv.innerHTML = '<p>Error: Unable to fetch transaction details.</p>';
    }
}

async function getBlockTimestamp(blockNumber) {
    const block = await web3.eth.getBlock(blockNumber);
    const $date = new Date(block.timestamp * 1000).toLocaleString();
    return($date);
}

async function displayBlockDetails(blockNumber) {
    try {
        const block = await web3.eth.getBlock(blockNumber);

        contentDiv.innerHTML = `
            <h2>Block Details</h2>
            <p><strong>Number:</strong> <a href="?block=${block.number}">${block.number}</a></p>
            <p><strong>Hash:</strong> ${block.hash}</p>
            <p><strong>Timestamp:</strong> ${new Date(block.timestamp * 1000).toLocaleString()}</p>
            <p><strong>Transactions:</strong> ${block.transactions.length}</p>
            <h3>Transactions:</h3>
            <ul>
                ${block.transactions.map(tx => `<li><a href="?tx=${tx}">${tx}</a></li>`).join('')}
            </ul>
        `;
    } catch (error) {
        contentDiv.innerHTML = '<p>Error: Unable to fetch block details.</p>';
    }
}

async function displayAccountDetails(address) {
    try {
        const balance = await web3.eth.getBalance(address);
        const txCount = await web3.eth.getTransactionCount(address);

        contentDiv.innerHTML = `
            <h2>Account Details</h2>
            <p><strong>Address:</strong> <a href="?address=${address}">${address}</a></p>
            <p><strong>Balance:</strong> ${web3.utils.fromWei(balance, 'ether')} ETH</p>
            <p><strong>Transaction Count:</strong> ${txCount}</p>
            <h3>Recent Transactions:</h3>
            <div id="recentTransactions"></div>
        `;

        displayRecentTransactions(address);
    } catch (error) {
        contentDiv.innerHTML = '<p>Error: Unable to fetch account details.</p>';
    }
}

async function displayRecentTransactions(address) {
    try {
        address = "0x"+address;
        const latestBlock = await web3.eth.getBlockNumber();
        const recentTransactions = [];

        for (let i = latestBlock; i > latestBlock - 100 && recentTransactions.length < 10; i--) {
            if(i<0) {
                break;
            }
            const block = await web3.eth.getBlock(i, true);
            var timestamp = await getBlockTimestamp(i);
            const relevantTxs = block.transactions.filter( (tx) => {
                //console.log("Transacción actual:", tx);
                //console.log("Desde:", tx.from, "Hasta:", tx.to, "Dirección:", address);
                if(tx.from == address || tx.to == address) {
                    tx.timestamp = timestamp;
                }
                console.log (tx.from == address || tx.to == address)
                return tx.from == address || tx.to == address;
            });
            console.log("relevantTxs")
            console.log(relevantTxs)
            console.log("......")
            recentTransactions.push(...relevantTxs);
            console.log(recentTransactions)

            if (recentTransactions.length >= 10) break;
        }

        const txList = recentTransactions.slice(0, 10).map(tx => {
            // Extraer el método de los primeros 4 bytes del input
            const methodSignature = tx.input.substr(0, 10); // '0x' + 8 caracteres
            console.log(tx.timestamp);
        
            return `
                <tr>
                    <td><a href="?tx=${tx.hash}">${tx.hash.substr(0, 15).padEnd(15, '.')}${tx.hash.length > 15 ? '...' : ''}</a></td>
                    <td>${methodSignature}</td>
                    <td> <a href="?block=${tx.blockNumber}">${tx.blockNumber.toString().substr(0, 15)}</a></td>
                    <td>${tx.timestamp}</td>
                    <td><a href="?address=${tx.from}"> ${tx.from.substr(0, 15).padEnd(15, '.')}${tx.from.length > 15 ? '...' : ''}</a></td>
                    <td><a href="?address=${tx.to}"> ${tx.to.substr(0, 15).padEnd(15, '.')}${tx.to.length > 15 ? '...' : ''}</a></td>
                    <td>${web3.utils.fromWei(tx.value, 'ether').substr(0, 15)}</td>
                    <td>${web3.utils.fromWei((tx.gas * tx.gasPrice).toString(), 'ether').substr(0, 15)}</td>
                </tr>
            `;
        }).join('');
        
        document.getElementById('recentTransactions').innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Transaction Hash</th>
                        <th>Method</th>
                        <th>Block</th>
                        <th>Age</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Amount</th>
                        <th>Txn Fee</th>
                    </tr>
                </thead>
                <tbody>
                    ${txList}
                </tbody>
            </table>
        `;

    } catch (error) {
        document.getElementById('recentTransactions').innerHTML = '<p>Error: Unable to fetch recent transactions.</p>';
    }
}

init();