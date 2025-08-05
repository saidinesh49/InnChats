class TrieNode {
  children: { [key: string]: TrieNode } = {};
  users: any[] = [];
}

export class Trie {
  root = new TrieNode();

  insert(user: any) {
    let node = this.root;
    const name = user.fullName.toLowerCase();
    for (let ch of name) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];
      node.users.push(user); // store ref for partial match
    }
  }

  search(prefix: string): any[] {
    let node = this.root;
    prefix = prefix.toLowerCase();
    for (let ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    return node.users;
  }

  clearAll() {
    this.root = new TrieNode();
  }
}
