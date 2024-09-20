<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blockchain Explorer</title>
    <link rel="stylesheet" href="http://localhost/explorer/styles.css">
    <script src="https://cdn.jsdelivr.net/npm/web3@1.5.2/dist/web3.min.js"></script>
</head>
<body>
    <header>
        <h1>Blockchain Explorer</h1>
        <nav>
            <input type="text" id="searchInput" placeholder="Search by Tx Hash, Block Number, or Address">
            <button id="searchButton">Search</button>
        </nav>
    </header>

    <main>
        <div id="content"></div>
    </main>

    <footer>
        <p>&copy; 2023 Blockchain Explorer</p>
    </footer>

    <script src="http://localhost/explorer/app.js"></script>
</body>
</html>