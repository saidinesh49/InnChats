class TrieNode {
  children: { [key: string]: TrieNode } = {};
  users: any[] = [];
}

export class Trie {
  root = new TrieNode();

  insert(user: any) {
    if (!user?.fullName || typeof user.fullName !== 'string') return;

    let node = this.root;
    const name = user.fullName.toLowerCase();
    for (let ch of name) {
      if (!node.children[ch]) {
        node.children[ch] = new TrieNode();
      }
      node = node.children[ch];

      // Prevent duplicate entries
      if (!node.users.some((u) => u._id === user._id)) {
        node.users.push(user);
      }
    }
  }

  search(prefix: string): any[] {
    let node = this.root;
    prefix = prefix.toLowerCase();
    for (let ch of prefix) {
      if (!node.children[ch]) return [];
      node = node.children[ch];
    }
    return [...node.users]; // return shallow copy to avoid external mutation
  }

  clearAll(): void {
    this.root = new TrieNode();
  }
}
