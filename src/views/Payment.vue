<template>
  <b-container>
    <v-card>
      <stepper :options="stepperOptions">
        <div slot="step-1">
          <h3>Keranjang Item</h3>
          <v-app style="margin-bottom: 15px">
            <v-card>
              <v-card-title>
                <b-button
                  variant="success"
                  v-on:click="add_data"
                  v-b-tooltip.hover.top
                  title="Add Data"
                  ><b-icon-plus></b-icon-plus> add data</b-button
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
                :items="data_item"
                :search="search"
                :footer-props="{
                  'items-per-page-options': [5, 10, 25, -1],
                }"
                :items-per-page="5"
              >
                <template v-slot:[`item.action`]="{ item }">
                  <b-button
                    size="sm"
                    variant="danger"
                    v-on:click="delete_data(item.index)"
                    v-b-tooltip.hover.left
                    :title="`Delete Item ${item.name}`"
                    ><b-icon-trash></b-icon-trash
                  ></b-button>
                </template>
              </v-data-table>
            </v-card>
          </v-app>
        </div>

        <div slot="step-2">
          <h3>Payment</h3>

          <b-row>
            <b-col
              ><b-form-input
                placeholder="Name"
                v-model="form.nama"
                :state="validation.nama"
              ></b-form-input
            ></b-col>
          </b-row>
          <b-row>
            <b-col
              ><b-form-input
                placeholder="Email"
                v-model="form.email"
                :state="validation.email"
              ></b-form-input
            ></b-col>
            <b-col
              ><b-form-input
                placeholder="Phone"
                v-model="form.phone"
                @keypress="onlyNumber"
                :state="validation.phone"
              ></b-form-input
            ></b-col>
          </b-row>
          <b-row>
            <b-col
              ><b-form-select
                v-model="form.selected_method"
                :options="options_method"
                class="mb-3"
              >
                <template #first>
                  <b-form-select-option :value="null" disabled
                    >Please select Method</b-form-select-option
                  >
                </template>
              </b-form-select>
            </b-col>
            <b-col
              ><b-form-input
                placeholder="Amount"
                v-model="grand_total"
                disabled
              ></b-form-input
            ></b-col>
          </b-row>

          <b-row>
            <b-col>
              <b-form-input
                placeholder="Pickup Address"
                v-model="form.address"
                :state="validation.address"
              ></b-form-input>
            </b-col>
            <b-col>
              <b-form-input
                placeholder="Pickup Area"
                v-model="form.area"
                :state="validation.area"
              ></b-form-input>
            </b-col>
          </b-row>

          <b-row>
            <b-col
              ><b-form-textarea
                id="textarea"
                placeholder="Comment"
                rows="3"
                max-rows="10"
                v-model="form.comment"
              ></b-form-textarea
            ></b-col>
          </b-row>

          <b-row class="mt-3">
            <b-col
              ><b-button
                variant="primary"
                :disabled="submit_disabled"
                align="center"
                v-b-tooltip.hover.left
                title="Submit Payment"
                v-on:click="proses_payment"
                ><b-icon-credit-card2-back></b-icon-credit-card2-back>
                Proses</b-button
              ></b-col
            >
          </b-row>
        </div>
      </stepper>
    </v-card>

    <!-- Modal -->

    <b-modal
      ref="modal"
      id="modal-lg"
      size="lg"
      title="Add Item List"
      :ok-disabled="disabled_submit"
      v-on:ok="add_data_item"
    >
      <b-row>
        <b-col cols="2"> Nama Item </b-col>
        <b-col cols="1" md="auto"> : </b-col>
        <b-col
          ><b-form-select
            v-model="list_item"
            :options="options_item"
            class="mb-3"
          >
            <template #first>
              <b-form-select-option :value="null" disabled
                >Please select Item</b-form-select-option
              >
            </template>
          </b-form-select></b-col
        >
        <b-col cols="2"> Qty </b-col>
        <b-col cols="1" md="auto"> : </b-col>
        <b-col
          ><b-form-input
            type="number"
            v-model="qty"
            :disabled="disabled_qty"
          ></b-form-input
        ></b-col>
      </b-row>
      <b-row>
        <b-col cols="2"> Price </b-col>
        <b-col cols="1" md="auto"> : </b-col>
        <b-col
          ><b-form-input disabled v-model="modal.price_full"></b-form-input
        ></b-col>
        <b-col cols="2"> Grand Total </b-col>
        <b-col cols="1" md="auto"> : </b-col>
        <b-col
          ><b-form-input disabled v-model="modal.total_full"></b-form-input
        ></b-col>
      </b-row>
    </b-modal>
    <!-- end modal -->
  </b-container>
</template>
<script>
import Stepper from "vuejs-stepper";
import Swal from "sweetalert2";
export default {
  components: { Stepper },
  data: function () {
    return {
      e1: 1,
      text_hidden: true,
      disabled_qty: true,
      url: "http://localhost:8080/api",
      disabled_submit: true,
      submit_disabled: true,
      modal: {
        price: 0,
        price_full: "0",
        total: 0,
        total_full: "0",
      },
      list_item: null,
      qty: 1,
      form: {
        nama: "",
        phone: "",
        email: "",
        address: "",
        area: "",
        amount: "",
        comment: "",
        selected_method: null,
        selected_channel: null,
      },
      validation: {
        nama: null,
        phone: null,
        email: null,
        address: null,
        area: null,
      },
      options_method: [
        { text: "Virtual Account", value: "va" },
        { text: "Bank Transfer", value: "banktransfer" },
        { text: "Convenience Store", value: "store" },
        { text: "COD", value: "cod" },
        { text: "Pay Later", value: "payleter" },
        { text: "QRIS ", value: "qris" },
      ],
      options_chanel: [
        { text: "Bag", value: "bag" },
        { text: "BCA", value: "bca" },
        { text: "BNI", value: "bni" },
        { text: "Cimb Niaga", value: "cimb" },
        { text: "Mandiri ", value: "mandiri" },
        { text: "Muamalat", value: "bmi" },
        { text: "BRI", value: "bri" },
      ],
      options_item: [
        { text: "Celana", value: "Celana&&100000" },
        { text: "Tas", value: "Tas&&150000" },
        { text: "Baju", value: "Baju&&75000" },
        { text: "Kacamata", value: "Kacamata&&100000" },
        { text: "Sepatu ", value: "Sepatu&&180000" },
        { text: "Ikat Pinggang", value: "Ikat Pinggang&&125000" },
        { text: "Jam Tangan", value: "Jam Tangan&&35000" },
      ],
      stepperOptions: {
        headers: [{ title: "Items" }, { title: "Payment" }],
        prevText: "Previous",
        nextText: "Next",
      },

      search: "",
      headers: [
        {
          text: "Item Name",
          align: "start",
          sortable: false,
          value: "name",
        },
        { text: "Qty", value: "qty" },
        { text: "Price", value: "price_full" },
        { text: "Total", value: "total_full" },
        { text: "Action", value: "action" },
      ],
      desserts: [
        {
          name: "Baju",
          qty: 1,
          price: 20000,
          price_full: this.format_uang(20000),
          total: 20000,
          total_full: this.format_uang(20000),
        },
        {
          name: "Celana",
          qty: 2,
          price: 50000,
          price_full: this.format_uang(50000),
          total: 100000,
          total_full: this.format_uang(100000),
        },
        {
          name: "Jam Tangan",
          qty: 2,
          price: 25000,
          price_full: this.format_uang(25000),
          total: 50000,
          total_full: this.format_uang(50000),
        },
      ],
    };
  },

  watch: {
    form: {
      handler() {
        this.cek_validation();
      },
      deep: true,
    },

    qty: function () {
      this.qty < 0 || this.qty === "" || this.qty === 0
        ? (this.qty = 1)
        : "nothing";
      this.qty === "0"
        ? (this.disabled_submit = true)
        : (this.disabled_submit = false);
      var total = this.modal.price * this.qty;
      this.modal.total = total;
      this.modal.total_full = this.format_uang(total);
    },

    list_item: function () {
      if (this.list_item !== null) {
        this.disabled_qty = false;
        this.disabled_submit = false;
        var item = this.list_item;
        var split_item = item.split("&&");
        var harga = split_item[1];
        this.modal.price = harga;
        this.modal.price_full = this.format_uang(harga);
        this.modal.total = harga;
        this.modal.total_full = this.format_uang(harga);
        this.cek_available(split_item[0])
          .then(() => {})
          .catch(() => {
            this.alert(
              "danger",
              "Data Duplicate",
              `${split_item[0]} Sudah Ada..!!`
            );
            this.reset_form();
          });
      }
    },
  },

  computed: {
    grand_total: function () {
      var total = 0;
      this.desserts.map((value) => {
        total += value.total;
      });

      return this.format_uang(total);
    },

    data_item: function () {
      return this.desserts
        .slice()
        .reverse()
        .map((value, index) => ({
          ...value,
          index: index,
          no: index + 1,
        }));
    },
  },

  methods: {
    onlyNumber: function ($event) {
      //console.log($event.keyCode); //keyCodes value
      let keyCode = $event.keyCode ? $event.keyCode : $event.which;
      if ((keyCode < 48 || keyCode > 57) && keyCode !== 46) {
        // 46 is dot
        $event.preventDefault();
      }
    },

    proses_payment: function () {
      let item = [];
      this.desserts.map((value) => {
        item.push(value.name.toString());
      });
      this.axios
        .post(this.url + "/redirect_payment", {
          item: item,
          nama: this.form.nama,
          phone: this.form.phone,
          email: this.form.email,
          address: this.form.address,
          area: this.form.area,
          comment: this.form.comment,
          method: this.form.selected_method,
        })
        .then((respon) => {
          if (respon.data.Status === 200) {
            this.alert("success", "Payment Success", "Payment Success Process");
            this.reset_form_personal();
            console.log(respon.data);
          } else if (respon.data.Status === 400) {
            this.alert("danger", "Payment Error", "Payment Error to Process");
          } else {
            this.alert(
              "danger",
              "Payment authorized",
              "Payment Authorized Process"
            );
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
      this.form.email !== ""
        ? (this.validation.email = true)
        : (this.validation.email = false);
      this.validEmail(this.form.email)
        ? (this.validation.email = true)
        : (this.validation.email = false);
      this.form.phone !== ""
        ? (this.validation.phone = true)
        : (this.validation.phone = false);
      this.form.address !== ""
        ? (this.validation.address = true)
        : (this.validation.address = false);
      this.form.area !== ""
        ? (this.validation.area = true)
        : (this.validation.area = false);

      this.form.nama !== "" &&
      this.form.email !== "" &&
      this.form.phone !== "" &&
      this.form.selected_method !== null &&
      this.form.address !== "" &&
      this.form.area !== "" &&
      this.validEmail(this.form.email)
        ? (this.submit_disabled = false)
        : (this.submit_disabled = true);
    },

    delete_data: function (index) {
      console.log(index);
      this.desserts.splice(index, 1);
    },

    format_uang: function (numb) {
      const format = numb.toString().split("").reverse().join("");
      const convert = format.match(/\d{1,3}/g);
      const rupiah = "Rp " + convert.join(".").split("").reverse().join("");
      return rupiah;
    },

    add_data_item: function () {
      var item_list = this.list_item;
      var split_item = item_list.split("&&");
      var item_name = split_item[0];
      let item = {
        name: item_name,
        qty: this.qty,
        price: this.modal.price,
        price_full: this.modal.price_full,
        total: this.modal.total,
        total_full: this.modal.total_full,
      };

      this.desserts.push(item);
      this.reset_form();
    },

    add_data: function () {
      this.show_modal();
    },

    reset_form: function () {
      this.qty = 1;
      this.disabled_qty = true;
      this.list_item = null;
      this.modal.price = 0;
      this.modal.price_full = "0";
      this.modal.total = 0;
      this.modal.total_full = "0";
      this.disabled_submit = true;
    },

    reset_form_personal: function () {
      this.form.nama = "";
      this.form.email = "";
      this.form.phone = "";
      this.form.selected_method = null;
      this.form.address = "";
      this.form.area = "";
    },

    cek_available: function (nama_item) {
      return new Promise((resolve, reject) => {
        this.desserts.map((value) => {
          if (value.name === nama_item) {
            reject();
          }
        });
        resolve();
      });
    },

    validEmail: function (email) {
      var re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    },

    alert: function (variant, title, body) {
      this.$bvToast.toast(body, {
        title: title,
        toaster: "b-toaster-top-center",
        variant: variant,
        solid: true,
      });
    },

    show_modal: function () {
      this.$refs.modal.show();
    },

    alert_koneksi: function () {
      Swal.fire({
        icon: "error Connection",
        title: "Oops...",
        text: "Check Your Connection..!",
      });
    },
  },
};
</script>

<style scoped>
button {
  color: white;
}
</style>