import { ObjectId } from "mongodb";

const same = (a, b) => a && b && String(a) === String(b);
export function canReadPost(user, post) {
  if (
    user?.role === "admin" ||
    same(user?._id, post.author_id) ||
    post.visibility === "public"
  )
    return true;
  if (post.visibility === "followers")
    return (user?.following || []).some((id) => same(id, post.author_id));
  if (post.visibility === "friends")
    return (user?.friends || []).some((id) => same(id, post.author_id));
  return false;
}
const forms = (ids) =>
  ids
    .filter((id) => ObjectId.isValid(String(id)))
    .flatMap((id) => [new ObjectId(String(id)), String(id)]);
export function postVisibilityFilter(user) {
  if (user?.role === "admin") return {};
  return {
    $or: [
      { visibility: "public" },
      { author_id: { $in: forms(user?._id ? [user._id] : []) } },
      {
        visibility: "followers",
        author_id: { $in: forms(user?.following || []) },
      },
      { visibility: "friends", author_id: { $in: forms(user?.friends || []) } },
    ],
  };
}
