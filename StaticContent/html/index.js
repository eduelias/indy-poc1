function logToDiv(to, message, inverse) {
  const node = prettyPrint(message.message, { maxDepth: 99, expanded: true }); // JSON.stringify(message.message, null, 2);
  const append = document.getElementById(to);
  if (inverse) {
    append.insertBefore(node, append.childNodes[0]);
  } else {
    append.appendChild(node);
  }
}

// const steward = io('http://localhost:4000');
// // use your socket
// steward.on('welcome', (message) => {
//   console.log(message);
// });

// steward.on('disconnect', () => console.clear());

// steward.on('log', (message) => logToDiv('steward', message));

// const government = io('http://localhost:4001');
// // use your socket
// government.on('welcome', (message) => {
//   console.log(message);
// });
// government.on('log', (message) => logToDiv('government', message));

// const alice = io('http://localhost:4002');
// alice.on('welcome', (message) => {
//   console.log(message);
// });
// alice.on('log', (message) => logToDiv('alice', message));

const explorer = io('http://localhost:4040');
explorer.on('welcome', (message) => {
  console.log(message);
});

explorer.on('log', (message) => logToDiv('ledger', message));
explorer.on('newtx', (message) => {
  if (Array.isArray(message)) {
    message.map((item) => {
      item.id = item.txnMetadata.seqNo;
      return logToDiv(
        'ledger',
        { message: { id: item.txnMetadata.seqNo, ...item } },
        true,
      );
    });
  } else {
    const item = message;
    item.id = item.txnMetadata.seqNo;
    return logToDiv(
      'ledger',
      { message: { id: item.txnMetadata.seqNo, ...item } },
      true,
    );
  }
});

// function send() {
//   const form = document.querySelector('form');

//   const json = {};
//   Array.from(form.querySelectorAll('input, select, textarea'))
//     .filter((element) => element.name)
//     .forEach((element) => {
//       json[element.name] =
//         element.type === 'checkbox' ? element.checked : element.value;
//     });

//   steward.emit('onboard', json);
// }
