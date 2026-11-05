package org.apache.hadoop.mapreduce;
import java.io.IOException;
public class Mapper<KEYIN, VALUEIN, KEYOUT, VALUEOUT> {
    public class Context {
        private java.util.List<Object[]> emits;
        public Context(java.util.List<Object[]> emits) { this.emits = emits; }
        public void write(KEYOUT key, VALUEOUT value) throws IOException, InterruptedException {
            emits.add(new Object[]{key.toString(), value.toString()});
        }
    }
    protected void setup(Context context) throws IOException, InterruptedException {}
    protected void map(KEYIN key, VALUEIN value, Context context) throws IOException, InterruptedException {
        // default identity
    }
    protected void cleanup(Context context) throws IOException, InterruptedException {}
    public void run(Context context, java.util.List<Object[]> inputs) throws Exception {
        setup(context);
        for (Object[] in : inputs) {
            map((KEYIN)in[0], (VALUEIN)in[1], context);
        }
        cleanup(context);
    }
}
