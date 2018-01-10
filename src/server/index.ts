import { TSDI } from "tsdi";
import "./bot";
import "./api";
import "./audio-cache";

const tsdi = new TSDI();
tsdi.enableComponentScanner();
