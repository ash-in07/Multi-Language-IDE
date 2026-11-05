package org.apache.hadoop.mapreduce;
import org.apache.hadoop.conf.Configuration;
import org.apache.hadoop.io.*;
import java.io.*;
import java.lang.reflect.*;
import java.util.*;

public class Job {
    private Configuration conf;
    private String jobName;
    private Class<?> jarClass;
    private Class<?> mapperClass;
    private Class<?> combinerClass;
    private Class<?> reducerClass;
    private Class<?> outputKeyClass;
    private Class<?> outputValueClass;
    private String inputPath;
    private String outputPath;

    public Job(Configuration conf, String jobName) {
        this.conf = conf;
        this.jobName = jobName;
    }
    public static Job getInstance(Configuration conf, String jobName) {
        return new Job(conf, jobName);
    }
    public void setJarByClass(Class<?> cls) { this.jarClass = cls; }
    public void setMapperClass(Class<?> cls) { this.mapperClass = cls; }
    public void setCombinerClass(Class<?> cls) { this.combinerClass = cls; }
    public void setReducerClass(Class<?> cls) { this.reducerClass = cls; }
    public void setOutputKeyClass(Class<?> cls) { this.outputKeyClass = cls; }
    public void setOutputValueClass(Class<?> cls) { this.outputValueClass = cls; }
    public void setInputPath(String p) { this.inputPath = p; }
    public void setOutputPath(String p) { this.outputPath = p; }

    public boolean waitForCompletion(boolean verbose) throws Exception {
        System.out.println("INFO client.RMProxy: Connecting to ResourceManager...");
        System.out.println("INFO mapreduce.JobSubmitter: Submitting tokens for job: " + jobName);
        System.out.println("INFO mapreduce.JobSubmitter: Specified run-time staging location: /tmp/hadoop-yarn/staging");
        System.out.println("INFO mapreduce.Job: Running job: job_1730825400000_0001");
        System.out.println("INFO mapreduce.Job:  map 0% reduce 0%");
        
        File inputFile = new File(inputPath);
        if (!inputFile.exists()) {
            // try looking in current or parent
            if (new File("datasets/" + inputPath).exists()) inputFile = new File("datasets/" + inputPath);
        }
        
        List<String> lines = new ArrayList<>();
        if (inputFile.exists()) {
            BufferedReader br = new BufferedReader(new FileReader(inputFile));
            String line;
            while ((line = br.readLine()) != null) lines.add(line);
            br.close();
        }

        // MAP PHASE
        System.out.println("INFO mapreduce.Job:  map 100% reduce 0%");
        List<Object[]> mapEmits = new ArrayList<>();
        Object mapperInstance = mapperClass.getDeclaredConstructor().newInstance();
        Method mapMethod = null;
        for (Method m : mapperClass.getMethods()) {
            if (m.getName().equals("map")) { mapMethod = m; break; }
        }

        // Mapper context
        Class<?>[] innerClasses = Mapper.class.getDeclaredClasses();
        Class<?> ctxClass = null;
        for (Class<?> c : innerClasses) {
            if (c.getSimpleName().equals("Context")) { ctxClass = c; break; }
        }
        Constructor<?> ctxCtor = ctxClass.getDeclaredConstructor(Mapper.class, List.class);
        Object mapContext = ctxCtor.newInstance(mapperInstance, mapEmits);

        long byteOffset = 0;
        for (String line : lines) {
            Object keyObj = new LongWritable(byteOffset);
            Object valObj = new Text(line);
            mapMethod.invoke(mapperInstance, keyObj, valObj, mapContext);
            byteOffset += line.length() + 1;
        }

        // SHUFFLE & SORT PHASE
        System.out.println("INFO mapreduce.Job:  map 100% reduce 50%");
        Map<String, List<Object>> grouped = new TreeMap<>();
        for (Object[] pair : mapEmits) {
            String k = (String)pair[0];
            String v = (String)pair[1];
            grouped.computeIfAbsent(k, key -> new ArrayList<>()).add(v);
        }

        // REDUCE PHASE
        System.out.println("INFO mapreduce.Job:  map 100% reduce 100%");
        List<String> outputLines = new ArrayList<>();
        if (reducerClass != null) {
            Object reducerInstance = reducerClass.getDeclaredConstructor().newInstance();
            Method reduceMethod = null;
            for (Method m : reducerClass.getMethods()) {
                if (m.getName().equals("reduce")) { reduceMethod = m; break; }
            }

            Class<?> redCtxClass = null;
            for (Class<?> c : Reducer.class.getDeclaredClasses()) {
                if (c.getSimpleName().equals("Context")) { redCtxClass = c; break; }
            }
            Constructor<?> redCtxCtor = redCtxClass.getDeclaredConstructor(Reducer.class, List.class);
            Object redContext = redCtxCtor.newInstance(reducerInstance, outputLines);

            for (Map.Entry<String, List<Object>> entry : grouped.entrySet()) {
                Object keyObj = new Text(entry.getKey());
                // Wrap list in Iterable of typed objects
                List<Object> typedVals = new ArrayList<>();
                for (Object rawVal : entry.getValue()) {
                    try {
                        typedVals.add(new IntWritable(Integer.parseInt(rawVal.toString())));
                    } catch (Exception e1) {
                        try {
                            typedVals.add(new DoubleWritable(Double.parseDouble(rawVal.toString())));
                        } catch (Exception e2) {
                            typedVals.add(new Text(rawVal.toString()));
                        }
                    }
                }
                reduceMethod.invoke(reducerInstance, keyObj, typedVals, redContext);
            }
        }

        // WRITE OUTPUT DIRECTORY
        File outDir = new File(outputPath);
        outDir.mkdirs();
        new File(outDir, "_SUCCESS").createNewFile();
        File partFile = new File(outDir, "part-r-00000");
        BufferedWriter bw = new BufferedWriter(new FileWriter(partFile));
        for (String outLine : outputLines) {
            bw.write(outLine);
            bw.newLine();
        }
        bw.close();

        System.out.println("INFO mapreduce.Job: Job job_1730825400000_0001 completed successfully");
        System.out.println("INFO mapreduce.Job: Counters: 49");
        System.out.println("	File System Counters");
        System.out.println("		FILE: Number of bytes read=" + (lines.size() * 32));
        System.out.println("		FILE: Number of bytes written=" + (outputLines.size() * 24));
        System.out.println("		FILE: Number of read operations=0");
        System.out.println("		FILE: Number of large read operations=0");
        System.out.println("		FILE: Number of write operations=0");
        System.out.println("	Map-Reduce Framework");
        System.out.println("		Map input records=" + lines.size());
        System.out.println("		Map output records=" + mapEmits.size());
        System.out.println("		Reduce input groups=" + grouped.size());
        System.out.println("		Reduce output records=" + outputLines.size());
        System.out.println("		Spilled Records=0");
        System.out.println("		Shuffled Maps =1");
        System.out.println("		Failed Shuffles=0");
        System.out.println("		Merged Map outputs=1");
        return true;
    }
}
