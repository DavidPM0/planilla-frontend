import {
  ArrowPathIcon,
  ArrowUturnUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import useFetchApi from "../../hooks/use-fetch";
import type { User } from "../../context/auth-context";
import { useState } from "react";

const StatusToggleButton = ({
  user,
  onStatusChange,
}: {
  user: User;
  onStatusChange: (userId: number, newStatus: boolean) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const { patch } = useFetchApi();

  const handleChangeStatus = async () => {
    setIsLoading(true);
    const newStatus = !user.estadoRegistro;
    try {
      await patch(`/auth/change-status/${user.id}`, {
        estadoRegistro: newStatus,
      });
      onStatusChange(user.id, newStatus);
    } catch (error) {
      alert("No se pudo actualizar el estado del usuario.");
    } finally {
      setIsLoading(false);
    }
  };

  const isActive = user.estadoRegistro;
  const buttonStyle = `flex items-center gap-1 px-2 py-1 rounded-md text-xs transition ${
    isLoading ? "cursor-not-allowed opacity-50" : ""
  }`;
  const activeStyle = `bg-red-100 text-red-700 hover:bg-red-200 ${buttonStyle}`;
  const inactiveStyle = `bg-green-100 text-green-700 hover:bg-green-200 ${buttonStyle}`;
  const iconStyle = "w-4 h-4";

  if (isLoading) {
    return (
      <button className={isActive ? activeStyle : inactiveStyle} disabled>
        <ArrowPathIcon className={`${iconStyle} animate-spin`} />
        {isActive ? "Desactivando..." : "Reactivando..."}
      </button>
    );
  }

  return (
    <button
      title={isActive ? "Desactivar usuario" : "Reactivar usuario"}
      onClick={handleChangeStatus}
      className={isActive ? activeStyle : inactiveStyle}
    >
      {isActive ? (
        <>
          <TrashIcon className={iconStyle} /> Desactivar
        </>
      ) : (
        <>
          <ArrowUturnUpIcon className={iconStyle} /> Reactivar
        </>
      )}
    </button>
  );
};

export default StatusToggleButton;
