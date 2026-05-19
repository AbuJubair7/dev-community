export function buildTree(comments: any[]): any[] {
  const map = new Map<string, any>();

  comments.forEach((c: any) => {
    map.set(c._id.toString(), { ...c, replies: [] });
  });

  const roots: any[] = [];

  comments.forEach((c: any) => {
    if (c.parentId) {
      const parent = map.get(c.parentId.toString());
      if (parent) parent.replies.push(map.get(c._id.toString()));
    } else {
      roots.push(map.get(c._id.toString()));
    }
  });

  return roots;
}
