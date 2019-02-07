<template>
  <div>
    <div class="container">
      <div class="tab-pane fade show active">
        <div class="row">
          <div class="col-md-12">
            <h3>Page 1</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'Page1',
    components: {},
    data() {
        return {}
    },
    methods: {},
    mounted() {},
}
</script>

<style scoped>
h1,
h2 {
    font-weight: normal;
}
ul {
    list-style-type: none;
    padding: 0;
}
li {
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #426cb9;
}

.tab-pane {
    margin-top: 20px;
}
</style>
