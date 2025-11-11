import { A } from "@solidjs/router";

export default () => {
  return (
    <div class="navbar bg-base-100 shadow-md">
      <div class="flex-1">
        <A href="/" class="btn btn-ghost text-2xl cursor-pointer">Solid Store</A>
      </div>
      <div class="flex-none">
        <ul class="menu menu-horizontal px-1">
          <li><A href="/cart">Cart</A></li>
          <li><A href="/about">About</A></li>
          <li><A href="/contact">Contact</A></li>
        </ul>
      </div>
    </div>
  )
};
