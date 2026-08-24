export default () => {
  return (
    <main class="bg-base-100 min-h-[70vh] p-6 lg:p-10">
      <div class="max-w-4xl mx-auto space-y-6">
        <h1 class="text-3xl lg:text-4xl font-bold">About Tinker Store</h1>
        <p class="text-base-content/80 leading-7">
          Tinker Store is a demo ecommerce project created to practice building a modern storefront using SolidJS for
          the frontend and a Python API for backend services.
        </p>
        <p class="text-base-content/80 leading-7">
          This app showcases common shopping experiences: browsing products, filtering, cart management, checkout flow,
          and product reviews. It is not a real commercial marketplace.
        </p>
        <div class="alert alert-info">
          <span>
            Personal project notice: product listings and checkout actions are for demonstration only and should not be
            treated as real purchases.
          </span>
        </div>
      </div>
    </main>
  )
}
