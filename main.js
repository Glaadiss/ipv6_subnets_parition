const readline = require("readline");
const ip6addr = require("ip6addr");
const fs = require("fs");

const FREE_SUBNET_KEY = "WOLNA";

function loadData(fileName, cb) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(fileName),
    console: false,
  });

  const lines = [];
  readInterface
    .on("line", (line) => lines.push(line))
    .on("close", () => cb(lines));
}

function prepareData(lines) {
  return lines
    .map((line) => line.split(" "))
    .map(([ipMask, ...key_parts]) => [ipMask, key_parts.join(" ")])
    .map(([ipMask, key]) => ({ ipMask, key }));
}

// przydział dla "Oddział 2" ma nieprawidłowy adres sieci. Takie błędy najlepiej jak by były naprawiane. Kolejny przykład błędu, to możliwe powtórzenia przydziałów, co powinno być sygnalizowane.
function validateData(rows) {
  rows.forEach((row, i) => {
    try {
      const correctedIpMask = ip6addr.createCIDR(row.ipMask).toString();
      row.ipMask = correctedIpMask;
    } catch (error) {
      throw Error(`IP ${ipMask} is incorrect in line ${i}`);
    }
  });

  rows.reduce((acc, { key }, i) => {
    if (acc.includes(key) && key != FREE_SUBNET_KEY) {
      throw Error(`Not unique key in line ${i}`);
    }
    return [...acc, key];
  }, []);

  rows.reduce((acc, { ipMask }, i) => {
    if (acc.includes(ipMask) && ipMask) {
      throw Error(`Not unique ip/mask in line ${i}`);
    }
    return [...acc, ipMask];
  }, []);
}

function sortByIp(rows) {
  return rows.sort(({ ipMask: a }, { ipMask: b }) => ip6addr.compareCIDR(a, b));
}

function assignHierarchy(rows) {
  const root = { ipMask: "fc00::/0", key: "__global__" };
  items = [...[...rows].reverse(), root];
  items.forEach((item) => {
    for (const possibleParent of items) {
      const range = ip6addr.createCIDR(possibleParent.ipMask);
      const maskParent = possibleParent.ipMask.split("/")[1];
      const maskItem = item.ipMask.split("/")[1];
      if (maskItem > maskParent && range.contains(item.ipMask.split("/")[0])) {
        possibleParent.children = possibleParent.children
          ? [...possibleParent.children, item]
          : [item];

        return;
      }
    }
  });

  const structuredItems = items[items.length - 1].children;

  return sortByIp(structuredItems);
}

function printRows(rows, space = 0) {
  rows.forEach((row) => {
    console.log(`${"*".repeat(space * 4)}${row.ipMask} ${row.key}`);
    if (row.children) {
      printRows(row.children, space + 1);
    }
  });
}

// brakujące podsieci do wypełnienia podsieci nadrzędnej (tylko w przypadku, gdy istnieje jakaś podsieć zawierająca się w nadrzędnej)
function fillSubnet(subnet) {
  if (!subnet.children) {
    return;
  }

  const [ip, mask] = subnet.ipMask.split("/");
  const maskNum = Number(mask);
  const directSubMask = maskNum + 1;
  subnet.children.forEach((child) => {
    fillSubnet(child);
  });

  subnet.children = sortByIp(subnet.children);

  const sub1 = ip6addr.parse(ip);
  const cidr1 = ip6addr.createCIDR(`${sub1.toString()}/${directSubMask}`);
  const cidr2 = ip6addr.createCIDR(
    `${cidr1.last().offset(2)}/${directSubMask}`
  );

  const shouldAddSub1 =
    subnet.children.every(
      ({ ipMask }) => !cidr1.contains(ipMask.split("/")[0])
    ) && !subnet.children.some(({ ipMask }) => ipMask === cidr1.toString());
  const shouldAddSub2 =
    subnet.children.every(
      ({ ipMask }) => !cidr2.contains(ipMask.split("/")[0])
    ) && !subnet.children.some(({ ipMask }) => ipMask === cidr2.toString());
  if (shouldAddSub1) {
    subnet.children.unshift({
      ipMask: cidr1.toString(),
      key: FREE_SUBNET_KEY,
    });
  }
  if (shouldAddSub2) {
    subnet.children.push({
      ipMask: cidr2.toString(),
      key: FREE_SUBNET_KEY,
    });
  }
}

if (!process.argv[2]) {
  throw Error("provide input file as first argument!");
}

loadData(process.argv[2], (lines) => {
  const rows = prepareData(lines);
  validateData(rows);
  const sortedRows = sortByIp(rows);
  const structuredRows = assignHierarchy(sortedRows);
  structuredRows.forEach(fillSubnet);
  printRows(structuredRows);
});
