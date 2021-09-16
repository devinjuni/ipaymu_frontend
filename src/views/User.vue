<template>
  <b-container>
    <!-- Table User -->
    <v-app>
      <v-card>
        <v-card-title>
          <b-button
            v-b-tooltip.hover.top
            title="Add Data"
            variant="success"
            v-on:click="add_data"
            size="sm"
            ><b-icon-plus></b-icon-plus> Add Data</b-button
          >
          <v-spacer></v-spacer>
          <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
          ></v-text-field>
        </v-card-title>
        <v-data-table
          :headers="headers"
          :items="data_user"
          :search="search"
          :options.sync="options"
          :server-items-length="totalDesserts"
          :loading="loading"
          class="elevation-1"
          :footer-props="{
            'items-per-page-options': [10, 25, 200, -1],
          }"
          :items-per-page="10"
        >
          <template v-slot:[`item.tipe_tanggal`]="{ item }">
            <v-chip
              :color="`${item.color_tanggal} lighten-4`"
              class="ml-0 mr-2 black--text"
              label
              small
            >
              {{ item.tipe_tanggal }}
            </v-chip>
          </template>
          <template v-slot:[`item.tipe_minggu`]="{ item }">
            <v-chip
              :color="`${item.color_minggu} lighten-4`"
              class="ml-0 mr-2 black--text"
              label
              small
            >
              {{ item.tipe_minggu }}
            </v-chip>
          </template>

          <template v-slot:[`item.action`]="{ item }">
            <b-button
              variant="primary"
              v-b-tooltip.hover.left
              :title="`Update Data ${item.nama}`"
              class="mr-1"
              size="sm"
              v-on:click="show_update(item)"
              ><b-icon-pencil-fill></b-icon-pencil-fill
            ></b-button>
            <b-button
              variant="danger"
              v-b-tooltip.hover.right
              :title="`Delete Data ${item.nama}`"
              size="sm"
              v-on:click="confirm_delete(item.id_user, item.no, item.nama)"
              ><b-spinner small v-if="item.spinner"></b-spinner
              ><b-icon-trash-fill v-if="item.icon"></b-icon-trash-fill
            ></b-button>
          </template>
        </v-data-table>
      </v-card>
    </v-app>

    <!--End Table User -->

    <!-- modal data -->

    <b-modal
      ref="modal"
      id="modal-lg"
      size="lg"
      :title="title"
      v-on:shown="focus_input"
      :ok-disabled="submit_disabled"
      v-on:ok="tipe === 'add' ? save_data() : update_data()"
    >
      <b-row>
        <b-col cols="2">User Key</b-col>
        <b-col cols="1" md="auto">:</b-col>
        <b-col
          ><b-form-input v-model="form.user_key" disabled></b-form-input
        ></b-col>
        <b-col cols="2">Pekerjaan</b-col>
        <b-col cols="1" md="auto">:</b-col>
        <b-col
          ><b-form-input
            v-model="form.pekerjaan"
            placeholder="Input Pekerjaan"
            :state="validation.pekerjaan"
          ></b-form-input
        ></b-col>
      </b-row>
      <b-row>
        <b-col cols="2">Nama</b-col>
        <b-col cols="1" md="auto">:</b-col>
        <b-col
          ><b-form-input
            v-model="form.nama"
            ref="nama"
            placeholder="Input Nama"
            :state="validation.nama"
          ></b-form-input
        ></b-col>
        <b-col cols="2">Tgl Lahir</b-col>
        <b-col cols="1" md="auto">:</b-col>
        <b-col
          ><date-picker
            v-model="form.tgl_lahir"
            placeholder="Input Tgl Lahir"
            :state="validation.tgl_lahir"
            valueType="format"
          ></date-picker
        ></b-col>
      </b-row>
    </b-modal>

    <!-- end modal -->
  </b-container>
</template>

<script>
import Swal from "sweetalert2";
import DatePicker from "vue2-datepicker";
import "vue2-datepicker/index.css";
export default {
  components: { DatePicker },
  data: function () {
    return {
      title: "",
      search: "",
      tipe: "add",
      submit_disabled: true,
      url: "http://localhost:8080/api",
      totalDesserts: 0,
      loading: true,
      options: {},
      form: {
        nama: "",
        pekerjaan: "",
        tgl_lahir: "",
        user_key: "Automatic",
        id_user: "",
      },
      validation: {
        nama: null,
        pekerjaan: null,
        tgl_lahir: null,
      },
      headers: [
        { text: "No", value: "no", align: "start", sortable: false },
        { text: "Nama Pekerjaan", value: "nama" },
        { text: "Pekerjaan", value: "pekerjaan" },
        { text: "Tanggal Lahir", value: "tgl_lahir_full" },
        { text: "Tipe Tanggal", value: "tipe_tanggal" },
        { text: "Tipe Minggu", value: "tipe_minggu" },
        { text: "Action", value: "action" },
      ],
      result_data: [],
    };
  },

  watch: {
    options: {
      handler() {
        this.show_page(this.search);
      },
      deep: true,
    },

    search: function () {
      this.show_page(this.search);
    },

    form: {
      handler() {
        this.cek_validation();
      },
      deep: true,
    },
  },

  mounted: function () {
    this.show_page();
  },

  computed: {
    data_user: function () {
      return this.result_data.map((value, index) => ({
        ...value,
        spinner: false,
        icon: true,
        color_tanggal: value.tipe_tanggal === "Genap" ? "teal" : "red",
        color_minggu: value.tipe_minggu === "Genap" ? "teal" : "red",
        no: index + 1,
      }));
    },
  },

  methods: {
    add_data: function () {
      this.reset_form();
      this.tipe = "add";
      this.title = "Tambah Data User";
      this.show_modal();
    },

    show_modal: function () {
      this.$refs.modal.show();
    },

    show_page: function (search) {
      this.loading = true;
      this.get_api_data_user(search).then((data) => {
        this.result_data = data.items;
        this.totalDesserts = data.total;
        this.loading = false;
      });
    },

    get_api_data_user: function (search) {
      return new Promise((resolve) => {
        const { sortBy, sortDesc, page, itemsPerPage } = this.options;
        this.axios
          .post(this.url + "/get_all_data_user", {
            search: search,
          })
          .then((respon) => {
            let items = respon.data.data;
            const total = items.length;

            if (sortBy.length === 1 && sortDesc.length === 1) {
              items = items.sort((a, b) => {
                const sortA = a[sortBy[0]];
                const sortB = b[sortBy[0]];

                if (sortDesc[0]) {
                  if (sortA < sortB) return 1;
                  if (sortA > sortB) return -1;
                  return 0;
                } else {
                  if (sortA < sortB) return -1;
                  if (sortA > sortB) return 1;
                  return 0;
                }
              });
            }

            if (itemsPerPage > 0) {
              items = items.slice(
                (page - 1) * itemsPerPage,
                page * itemsPerPage
              );
            }

            setTimeout(() => {
              resolve({
                items,
                total,
              });
            }, 1000);
          })
          .catch(() => {
            this.alert_koneksi();
          });
      }).catch(() => {
        this.alert_koneksi();
      });
    },

    confirm_delete: function (id, no, nama) {
      this.data_user[no - 1].spinner = true;
      this.data_user[no - 1].icon = false;
      this.$confirm({
        title: "Delete Data",
        message: `Are you sure Delete Data ${nama}?`,
        button: {
          no: "No",
          yes: "Yes",
        },
        callback: (confirm) => {
          if (confirm) {
            this.delete_data(id);
          } else {
            this.data_user[no - 1].spinner = false;
            this.data_user[no - 1].icon = true;
          }
        },
      });
    },

    delete_data: function (id) {
      this.axios
        .post(this.url + "/delete_data_user", {
          id_user: id,
        })
        .then((respon) => {
          if (respon.data.pesan === "success") {
            this.alert(
              respon.data.variant,
              respon.data.title,
              respon.data.body
            );
            this.show_page();
          } else {
            this.alert_database();
          }
        })
        .catch(() => {
          this.alert_koneksi();
        });
    },

    show_update: function (item) {
      this.tipe = "update";
      this.title = "Update Data " + item.nama;
      this.form.id_user = item.id_user;
      this.form.user_key = item.user_key;
      this.form.nama = item.nama;
      this.form.pekerjaan = item.pekerjaan;
      this.form.tgl_lahir = item.tgl_lahir;
      this.show_modal();
    },

    update_data: function () {
      this.axios
        .post(this.url + "/update_data_user", {
          nama: this.form.nama,
          pekerjaan: this.form.pekerjaan,
          tgl_lahir: this.form.tgl_lahir,
          id_user: this.form.id_user,
        })
        .then((respon) => {
          if (respon.data.pesan === "success") {
            this.alert(
              respon.data.variant,
              respon.data.title,
              respon.data.body
            );
            this.show_page();
          } else {
            this.alert_database();
          }
        })
        .catch(() => {
          this.alert_koneksi();
        });
    },

    save_data: function () {
      this.axios
        .post(this.url + "/save_data_user", {
          nama: this.form.nama,
          pekerjaan: this.form.pekerjaan,
          tgl_lahir: this.form.tgl_lahir,
        })
        .then((respon) => {
          if (respon.data.pesan === "success") {
            this.alert(
              respon.data.variant,
              respon.data.title,
              respon.data.body
            );
            this.show_page();
          } else {
            this.alert_database();
          }
        })
        .catch(() => {
          this.alert_koneksi();
        });
    },

    cek_validation: function () {
      this.form.nama !== ""
        ? (this.validation.nama = true)
        : (this.validation.nama = false);
      this.form.pekerjaan !== ""
        ? (this.validation.pekerjaan = true)
        : (this.validation.pekerjaan = false);
      this.form.tgl_lahir !== ""
        ? (this.validation.tgl_lahir = true)
        : (this.validation.tgl_lahir = false);

      this.form.nama !== "" &&
      this.form.pekerjaan !== "" &&
      this.form.tgl_lahir !== ""
        ? (this.submit_disabled = false)
        : (this.submit_disabled = true);
    },

    alert_koneksi: function () {
      Swal.fire({
        icon: "error Connection",
        title: "Oops...",
        text: "Check Your Connection..!",
      });
    },

    alert_database: function () {
      Swal.fire({
        icon: "error Client",
        title: "Oops...",
        text: "Error In Client..!",
      });
    },

    alert: function (variant, title, body) {
      this.$bvToast.toast(body, {
        title: title,
        toaster: "b-toaster-top-center",
        variant: variant,
        solid: true,
      });
    },

    focus_input: function () {
      this.$refs.nama.focus();
    },

    reset_form: function () {
      this.form.nama = "";
      this.form.pekerjaan = "";
      this.form.tgl_lahir = "";
      this.form.id_user = "";
      this.form.user_key = "Automatic";
    },
  },
};
</script>
<style scoped>
button {
  color: white;
}
</style>