import { useState } from "react";

export function usePopup() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");

  function triggerPopup(msg: string) {
    setMessage(msg);
    setShow(true);
  }

  function closePopup() {
    setShow(false);
  }

  return { show, message, triggerPopup, closePopup };
}