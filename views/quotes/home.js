import $ from "jquery";

$("#speak").click(() => $.ajax("/api/quotes/speak"));
