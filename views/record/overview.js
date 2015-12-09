import $ from "jquery";

$("#random").click(() => $.ajax("/api/record/random"));
