import { useOthers, useSelf } from "@liveblocks/react";
import { Avatar } from "./Avatar";
import styles from "./index.module.css";
import { generateRandomName } from "@/lib/utils";
import { useMemo } from "react";

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;
  const memoizedUsers = useMemo(
    () => (
      <main className="flex w-full select-none justify-end items-center">
        <div className="flex pl-3">
          {currentUser && (
            <Avatar
              src={"currentUser.info.avatar"}
              otherStyles="border-[3px] border-primary-green"
              name="You"
            />
          )}
          {users.slice(0, 3).map(({ connectionId, info }) => {
            return (
              <Avatar
                key={connectionId}
                src={"info.avatar"}
                name={generateRandomName()}
                otherStyles="-ml-3"
              />
            );
          })}

          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </main>
    ),
    [users.length]
  );

  return memoizedUsers;
};
export default ActiveUsers;
