package org.apache.hadoop.mapreduce;
import java.io.IOException;
public class Reducer<KEYIN, VALUEIN, KEYOUT, VALUEOUT> {
    public class Context {
        private java.util.List<String> outputLines;
        public Context(java.util.List<String> outputLines) { this.outputLines = outputLines; }
        public void write(KEYOUT key, VALUEOUT value) throws IOException, InterruptedException {
            outputLines.add(key.toString() + "\t" + value.toString());
        }
    }
    protected void setup(Context context) throws IOException, InterruptedException {}
    protected void reduce(KEYIN key, Iterable<VALUEIN> values, Context context) throws IOException, InterruptedException {
        for (VALUEIN val : values) {
            context.write((KEYOUT)key, (VALUEOUT)val);
        }
    }
    protected void cleanup(Context context) throws IOException, InterruptedException {}
}
