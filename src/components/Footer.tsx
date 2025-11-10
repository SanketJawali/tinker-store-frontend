export default () => {
  return (
    <footer class="footer footer-horizontal footer-center bg-base-200 text-base-content rounded p-10">
      <aside>
        <p>Copyright © {new Date().getFullYear()} - Demo Store UI</p>
      </aside>
      <nav class="grid grid-flow-col gap-4">
        <a class="link link-hover">Home</a>
        <a class="link link-hover">About</a>
        <a class="link link-hover">Contact</a>
      </nav>
    </footer>
  )
}
